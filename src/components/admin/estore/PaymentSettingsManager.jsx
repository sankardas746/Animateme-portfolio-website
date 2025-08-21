import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save } from 'lucide-react';

const PaymentSettingsManager = () => {
    const [settings, setSettings] = useState({ 
      method_name: '', 
      method_description: '', 
      qr_code_url: '',
      upi_id: '',
      bank_account_details: { name: '', account_number: '', bank_name: '', ifsc_code: '' },
      whatsapp_number: ''
    });
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const qrCodeRef = useRef(null);

    const fetchSettings = useCallback(async () => {
        const { data, error } = await supabase.from('payment_settings').select('*').single();
        if (error && error.code !== 'PGRST116') {
            toast({ title: 'Error fetching payment settings', description: error.message, variant: 'destructive' });
        } else if (data) {
            setSettings({
              ...data,
              bank_account_details: data.bank_account_details || { name: '', account_number: '', bank_name: '', ifsc_code: '' }
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleFileUpload = async (file) => {
        if (!file) return null;
        setIsUploading(true);
        const filePath = `${Date.now()}-${file.name}`;
        try {
            const { data, error } = await supabase.storage.from('qrcodes').upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage.from('qrcodes').getPublicUrl(data.path);
            setIsUploading(false);
            return publicUrlData.publicUrl;
        } catch (error) {
            console.error("Upload error:", error);
            toast({ title: "QR Code upload failed", description: error.message, variant: "destructive" });
            setIsUploading(false);
            return null;
        }
    };
    
    const handleQrCodeChange = async (e) => {
        const file = e.target.files[0];
        const url = await handleFileUpload(file);
        if (url) {
            setSettings(s => ({ ...s, qr_code_url: url }));
        }
    };

    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;
        setSettings(s => ({
            ...s,
            bank_account_details: {
                ...s.bank_account_details,
                [name]: value
            }
        }));
    };

    const handleSave = async () => {
        const { id, created_at, ...updateData } = settings;
        updateData.updated_at = new Date();

        if (id) {
             const { error } = await supabase.from('payment_settings').update(updateData).eq('id', id);
             if (error) {
                toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
            } else {
                toast({ title: 'Success', description: 'Payment settings saved.' });
            }
        } else {
             const { data, error } = await supabase.from('payment_settings').insert(updateData).select().single();
              if (error) {
                toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
            } else {
                toast({ title: 'Success', description: 'Payment settings saved.' });
                if(data) {
                  setSettings({
                    ...data,
                    bank_account_details: data.bank_account_details || { name: '', account_number: '', bank_name: '', ifsc_code: '' }
                  });
                }
            }
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <h3 className="text-xl font-semibold">Payment Settings</h3>
            <div>
                <Label>Payment Method Name</Label>
                <Input value={settings.method_name || ''} onChange={(e) => setSettings(s => ({ ...s, method_name: e.target.value }))} placeholder="e.g., Manual Bank Transfer"/>
            </div>
            <div>
                <Label>Description / Instructions</Label>
                <Textarea value={settings.method_description || ''} onChange={(e) => setSettings(s => ({ ...s, method_description: e.target.value }))} placeholder="Instructions for customers to complete the payment."/>
            </div>
             <div>
                <Label>WhatsApp Number</Label>
                <Input value={settings.whatsapp_number || ''} onChange={(e) => setSettings(s => ({ ...s, whatsapp_number: e.target.value }))} placeholder="e.g., 911234567890 (with country code)"/>
            </div>
            
            <div className="border-t pt-6 space-y-4">
                <h4 className="font-semibold">UPI Details</h4>
                <div>
                    <Label>UPI ID</Label>
                    <Input value={settings.upi_id || ''} onChange={(e) => setSettings(s => ({ ...s, upi_id: e.target.value }))} placeholder="example@upi"/>
                </div>
                 <div>
                    <Label>UPI QR Code Image</Label>
                    <div className="flex items-center gap-4 mt-2">
                        {settings.qr_code_url && <img src={settings.qr_code_url} alt="QR Code" className="w-32 h-32 object-contain rounded-md border p-1" />}
                        <input type="file" ref={qrCodeRef} onChange={handleQrCodeChange} className="hidden" accept="image/*" />
                        <Button type="button" variant="outline" onClick={() => qrCodeRef.current.click()} disabled={isUploading}>
                            <Upload className="w-4 h-4 mr-2" /> {isUploading ? 'Uploading...' : (settings.qr_code_url ? 'Change QR Code' : 'Upload QR Code')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 space-y-4">
                <h4 className="font-semibold">Bank Account Details</h4>
                <div>
                    <Label>Account Holder Name</Label>
                    <Input name="name" value={settings.bank_account_details?.name || ''} onChange={handleBankDetailsChange} />
                </div>
                <div>
                    <Label>Account Number</Label>
                    <Input name="account_number" value={settings.bank_account_details?.account_number || ''} onChange={handleBankDetailsChange} />
                </div>
                <div>
                    <Label>Bank Name</Label>
                    <Input name="bank_name" value={settings.bank_account_details?.bank_name || ''} onChange={handleBankDetailsChange} />
                </div>
                <div>
                    <Label>IFSC Code</Label>
                    <Input name="ifsc_code" value={settings.bank_account_details?.ifsc_code || ''} onChange={handleBankDetailsChange} />
                </div>
            </div>

            <Button onClick={handleSave} disabled={isUploading}>
                <Save className="mr-2 h-4 w-4" /> {isUploading ? 'Uploading...' : 'Save Settings'}
            </Button>
        </div>
    );
};

export default PaymentSettingsManager;