import {
  AlignJustify, Briefcase, CircleAlert, Filter, MoreVertical, Search,
  Loader2, X, FileSignature, CheckCircle, Calendar, HandCoins, PenLine, Trash2, Download
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Topbar from "../admin/Topbar";
import ClientSidebar from "./ClientSidebar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { downloadContractPDF } from "../../lib/downloadSignedContract";

export default function ClientContracts() {
  const { logout, user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureStep, setSignatureStep] = useState<'review' | 'sign'>('review');
  const [hasDrawn, setHasDrawn] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  // ── Canvas drawing helpers ──────────────────────────────────────────────────
  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if (e instanceof TouchEvent) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e.nativeEvent as MouseEvent | TouchEvent, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    e.preventDefault();
    const pos = getPos(e.nativeEvent as MouseEvent | TouchEvent, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPosRef.current = pos;
    setHasDrawn(true);
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // ── Sign submission ─────────────────────────────────────────────────────────
  const handleSignContract = async () => {
    if (!selectedContract || !canvasRef.current) return;
    const signatureData = canvasRef.current.toDataURL('image/png');
    setIsSigning(true);
    try {
      await api.put(`/contracts/${selectedContract._id}/sign`, { signatureData });
      setIsModalOpen(false);
      setSignatureStep('review');
      setHasDrawn(false);
      fetchContracts();
      alert("Contract signed successfully!");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to sign contract. Please try again.";
      alert(message);
    } finally {
      setIsSigning(false);
    }
  };

  const openReviewModal = (contract: any) => {
    setSelectedContract(contract);
    setSignatureStep('review');
    setHasDrawn(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSignatureStep('review');
    setHasDrawn(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "status-active";
      case "expired": return "status-suspended";
      case "pending": return "status-suspended !bg-yellow-100 !text-yellow-700";
      default: return "status-suspended";
    }
  };

  const stats = {
    active: contracts.filter((c: any) => c.status === 'active').length,
    pending: contracts.filter((c: any) => c.status === 'pending').length,
    expired: contracts.filter((c: any) => c.status === 'expired').length,
  };

  return (
    <main className="dashboard-page client-dashboard-page">
      <ClientSidebar onLogout={logout} activeItem="Contracts" />

      <section className="dashboard-main text-gray-900">
        <Topbar title="Contracts" />

        <div className="dashboard-content">
          <div className="client-request-header">
            <button
              type="button"
              className="client-btn-review-contracts"
              onClick={() => {
                const firstPending = contracts.find((c: any) => c.status === 'pending');
                if (firstPending) openReviewModal(firstPending);
                else alert("No pending contracts to review.");
              }}
            >
              <CircleAlert size={16} />
              Review and Sign Contracts
            </button>

            <div className="client-request-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search contracts" className="search-input" />
              </div>
              <button type="button" className="btn-filter">
                <Filter size={18} /> Filter
              </button>
              <button type="button" className="btn-menu" aria-label="View options">
                <AlignJustify size={20} />
              </button>
            </div>
          </div>

          <div className="client-request-stats">
            <div className="client-request-stat-card">
              <div className="client-request-stat-icon text-green-600"><CheckCircle size={18} /></div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Active Contracts</div>
                <div className="client-request-stat-value">{stats.active}</div>
              </div>
            </div>
            <div className="client-request-stat-card">
              <div className="client-request-stat-icon text-yellow-600"><FileSignature size={18} /></div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Pending</div>
                <div className="client-request-stat-value">{stats.pending}</div>
              </div>
            </div>
            <div className="client-request-stat-card">
              <div className="client-request-stat-icon text-red-600"><Calendar size={18} /></div>
              <div className="client-request-stat-info">
                <div className="client-request-stat-label">Expired</div>
                <div className="client-request-stat-value">{stats.expired}</div>
              </div>
            </div>
          </div>

          <div className="employees-table-container client-contracts-table-wrap">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <table className="employees-table client-request-table">
                <thead>
                  <tr>
                    <th>Contract ID</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((entry: any) => (
                    <tr key={entry._id}>
                      <td className="font-mono text-xs">#{entry._id.slice(-6)}</td>
                      <td>
                        <div className="font-medium">{entry.title}</div>
                        <div className="text-[10px] text-gray-500">{entry.paymentFrequency.toUpperCase()} PAYMENT</div>
                      </td>
                      <td className="text-gray-600 text-xs">
                        <div>Start: {new Date(entry.startDate).toLocaleDateString()}</div>
                        <div>End: {new Date(entry.endDate).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(entry.status)}`}>{entry.status}</span>
                      </td>
                      <td>
                        {entry.status === 'pending' ? (
                          <button
                            onClick={() => openReviewModal(entry)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition-colors"
                          >
                            Review & Sign
                          </button>
                        ) : (
                          <button
                            onClick={() => openReviewModal(entry)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No contracts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* ── Contract Modal ─────────────────────────────────────────────────── */}
      {isModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="bg-[#222659] p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold">{selectedContract.title}</h3>
                <p className="text-xs opacity-70 font-mono">ID: {selectedContract._id}</p>
              </div>
              <button onClick={closeModal} className="hover:bg-white/10 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Step indicator (only for pending) */}
            {selectedContract.status === 'pending' && (
              <div className="flex border-b shrink-0">
                <button
                  onClick={() => setSignatureStep('review')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${signatureStep === 'review' ? 'border-b-2 border-[#222659] text-[#222659]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  1. Review Contract
                </button>
                <button
                  onClick={() => setSignatureStep('sign')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${signatureStep === 'sign' ? 'border-b-2 border-[#F26323] text-[#F26323]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  2. Sign Contract
                </button>
              </div>
            )}

            {/* ── Step 1: Review ── */}
            {signatureStep === 'review' && (
              <div className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><HandCoins size={20} /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Amount</p>
                      <p className="font-bold text-gray-900">Ksh {selectedContract.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Frequency</p>
                      <p className="font-bold text-gray-900 capitalize">{selectedContract.paymentFrequency}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">
                    Contract Terms & Conditions
                  </h4>
                  <div className="prose prose-sm text-gray-700 max-w-none whitespace-pre-wrap leading-relaxed">
                    {selectedContract.terms || "No specific terms provided for this contract."}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Validity Period</h4>
                  <div className="flex justify-between text-sm">
                    <span>Starts: <strong>{new Date(selectedContract.startDate).toLocaleDateString()}</strong></span>
                    <span>Ends: <strong>{new Date(selectedContract.endDate).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                {selectedContract.signedAt && (
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                    <CheckCircle size={18} />
                    Signed on {new Date(selectedContract.signedAt).toLocaleDateString()}
                  </div>
                )}

                {/* Show existing signature if already signed */}
                {selectedContract.signature && (
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Digital Signature on File</p>
                    <img
                      src={selectedContract.signature}
                      alt="Client signature"
                      className="max-h-20 border border-gray-200 rounded bg-white p-2"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Sign ── */}
            {signatureStep === 'sign' && (
              <div className="p-8 overflow-y-auto space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  <strong>Legal Notice:</strong> By signing below, you confirm that you have read, understood, and agree to all terms and conditions of this contract. Your digital signature is legally binding.
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <PenLine size={16} /> Draw Your Signature
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                    >
                      <Trash2 size={13} /> Clear
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={160}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  {!hasDrawn && (
                    <p className="text-xs text-gray-400 mt-1 text-center">Sign in the box above using your mouse or touch</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                  <div><span className="font-semibold">Signee:</span> {user?.name}</div>
                  <div><span className="font-semibold">Contract:</span> {selectedContract.title}</div>
                  <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex space-x-3 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white text-gray-700 transition-all"
              >
                Close
              </button>

              {selectedContract.status !== 'pending' && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await api.get(`/contracts/${selectedContract._id}`);
                      downloadContractPDF(res.data);
                    } catch {
                      downloadContractPDF(selectedContract);
                    }
                  }}
                  className="flex-1 py-3 bg-[#222659] text-white rounded-lg font-semibold hover:bg-[#1a1e4a] transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              )}

              {selectedContract.status === 'pending' && signatureStep === 'review' && (
                <button
                  type="button"
                  onClick={() => setSignatureStep('sign')}
                  className="flex-[2] py-3 bg-[#222659] text-white rounded-lg font-bold hover:bg-[#1a1e4a] flex items-center justify-center gap-2 transition-all"
                >
                  <PenLine size={18} /> Proceed to Sign
                </button>
              )}

              {selectedContract.status === 'pending' && signatureStep === 'sign' && (
                <button
                  type="button"
                  disabled={isSigning || !hasDrawn}
                  onClick={handleSignContract}
                  className="flex-[2] py-3 bg-[#F26323] text-white rounded-lg font-bold hover:bg-[#d9561d] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all"
                >
                  {isSigning
                    ? <><Loader2 className="animate-spin" size={18} /> Signing...</>
                    : <><FileSignature size={18} /> Sign & Accept Contract</>
                  }
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
