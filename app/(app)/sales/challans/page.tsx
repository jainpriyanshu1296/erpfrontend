'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, QrCode, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ModuleWorkspace } from '@/components/module-workspace';
import { QrScannerModal } from '@/components/qr-scanner';
import { api } from '@/lib/api';
import { useToast } from '@/components/toast';

interface EwayBillResult {
  eway_bill_no: string;
  eway_bill_date: string;
  valid_until: string;
  vehicle_number: string;
  consignment_value: number;
}

export default function Page() {
  const { showToast } = useToast();
  const client = useQueryClient();

  // E-Way Bill state
  const [selectedChallanId, setSelectedChallanId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ewbResult, setEwbResult] = useState<EwayBillResult | null>(null);
  const [isEwbOpen, setIsEwbOpen] = useState(false);

  // QR Scanner verification state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [verifyOrderId, setVerifyOrderId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const ewbMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChallanId || !vehicleNumber) {
        throw new Error('Challan ID and Vehicle Number are required');
      }
      const res = await api.post<EwayBillResult>(`/sales/challans/${selectedChallanId}/generate-ewaybill`, {
        vehicle_number: vehicleNumber
      });
      return res.data;
    },
    onSuccess: (data) => {
      setEwbResult(data);
      showToast(`E-Way Bill #${data.eway_bill_no} generated (Valid for 72h)`, 'success');
      client.invalidateQueries({ queryKey: ['/sales/challans'] });
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Failed to generate E-Way Bill', 'error');
    }
  });

  const handleScanVerified = async (scannedCode: string) => {
    try {
      const res = await api.post<{ verified: boolean; message: string }>('/sales/challans/verify-scan', {
        sales_order_id: verifyOrderId,
        scanned_code: scannedCode
      });
      if (res.data.verified) {
        setVerificationStatus(`MATCH: ${res.data.message}`);
        showToast(res.data.message, 'success');
      } else {
        setVerificationStatus(`MISMATCH: ${res.data.message}`);
        showToast(res.data.message, 'error');
      }
    } catch {
      setVerificationStatus(`Item scanned: ${scannedCode}`);
      showToast(`Scanned: ${scannedCode}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Bar for E-Way Bill & Dispatch Verification */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 7.2 E-Way Bill Generator Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">7.2 NIC E-Way Bill Portal</h2>
              <p className="text-[11px] text-slate-500">Auto-generate 12-digit E-Way Bill with 72-hour validity</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Challan ID / Number</label>
              <input
                type="text"
                value={selectedChallanId}
                onChange={e => setSelectedChallanId(e.target.value)}
                placeholder="e.g. challan_id or DC-0001"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Vehicle Number (Part-B)</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MP09AB1234"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono uppercase outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              disabled={ewbMutation.isPending || !selectedChallanId || !vehicleNumber}
              onClick={() => ewbMutation.mutate()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              <Truck size={14} />
              {ewbMutation.isPending ? 'Generating E-Way Bill...' : 'Generate E-Way Bill'}
            </button>

            {ewbResult && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={14} />
                EWB: {ewbResult.eway_bill_no}
              </span>
            )}
          </div>
        </div>

        {/* 5.4 Dispatch Verification Barcode Scanner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">5.4 Dispatch Verification Scanner</h2>
              <p className="text-[11px] text-slate-500">Scan box QR before loading to prevent dispatch mismatches</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[11px] font-semibold text-slate-600">Sales Order ID for Verification</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={verifyOrderId}
                onChange={e => setVerifyOrderId(e.target.value)}
                placeholder="Enter SO ID (e.g. SO-00012)"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <QrCode size={14} />
                Open Camera
              </button>
            </div>
          </div>

          {verificationStatus && (
            <p className={`mt-3 text-xs font-medium ${verificationStatus.startsWith('MATCH') ? 'text-emerald-700' : 'text-red-600'}`}>
              {verificationStatus}
            </p>
          )}
        </div>
      </div>

      {/* Main Delivery Challan Workspace */}
      <ModuleWorkspace
        title="Delivery Challans"
        description="Manage dispatch challans, e-way bills, vehicle details, and auto-draft tax invoices."
        endpoint="/sales/challans"
        columns={['challan_number', 'customer_id', 'vehicle_number', 'eway_bill_no', 'challan_date', 'created_at']}
        fields={[
          { key: 'challan_number', label: 'Challan number', required: true },
          { key: 'customer_id', label: 'Customer', required: true },
          { key: 'vehicle_number', label: 'Vehicle registration' },
          { key: 'challan_date', label: 'Challan date', type: 'date', required: true }
        ]}
      />

      {/* Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanVerified}
        title="Dispatch Verification Scanner"
        description="Scan item barcode/QR before vehicle dispatch. The system will verify against SO lines."
      />
    </div>
  );
}
