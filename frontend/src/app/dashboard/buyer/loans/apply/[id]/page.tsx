'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { applyForLoan, predictLoan } from '@/lib/api/loans';
import { getPropertyById } from '@/lib/properties/storage';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import Container from '@/components/layout/Container';

export default function ApplyLoanPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [form, setForm] = useState({
        loan_amount: '',
        interest_rate: '5.5',
        income: '',
        age: '',
        credit_score: '',
        loan_term: '30',
        employment_status: 'Employed',
        message: ''
    });

    const [isPredicting, setIsPredicting] = useState(false);
    const [prediction, setPrediction] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePredict = async () => {
        if (!form.age || !form.income || !form.credit_score || !form.loan_amount || !form.loan_term) {
            toast.error('Please fill in all financial details to predict.');
            return;
        }

        setIsPredicting(true);
        try {
            const predictionPayload = {
                ...form,
                loan_term: parseInt(form.loan_term) * 12 // ML requires months
            };
            const res = await predictLoan(predictionPayload);
            setPrediction(res.prediction);
            if (res.prediction === 'Loan Approved') {
                toast.success('High probability of approval!');
            } else {
                toast.error('Low probability of approval, you can still apply.');
            }
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Failed to run AI prediction.');
        } finally {
            setIsPredicting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await applyForLoan({ 
                PropertyID: id,
                LoanAmount: form.loan_amount,
                InterestRate: form.interest_rate,
                Age: form.age,
                CreditScore: form.credit_score,
                LoanTerm: parseInt(form.loan_term) * 12
            });
            toast.success('Loan Application Submitted!');
            router.push('/dashboard/buyer/loans');
        } catch (e: any) {
            console.error('Submission failed', e.response?.data);
            toast.error(JSON.stringify(e.response?.data) || 'Failed to submit application');
        }
    };

    return (
        <Container className="py-12 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Apply for Mortgage</h1>
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount ($)</label>
                            <input name="loan_amount" type="number" required value={form.loan_amount} onChange={handleChange} className="w-full rounded-md border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income ($)</label>
                            <input name="income" type="number" required value={form.income} onChange={handleChange} className="w-full rounded-md border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input name="age" type="number" required value={form.age} onChange={handleChange} className="w-full rounded-md border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score</label>
                            <input name="credit_score" type="number" required value={form.credit_score} onChange={handleChange} className="w-full rounded-md border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years)</label>
                            <select name="loan_term" value={form.loan_term} onChange={handleChange} className="w-full rounded-md border p-2">
                                <option value="15">15 Years</option>
                                <option value="30">30 Years</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employment</label>
                            <select name="employment_status" value={form.employment_status} onChange={handleChange} className="w-full rounded-md border p-2">
                                <option value="Employed">Employed</option>
                                <option value="Self-Employed">Self-Employed</option>
                                <option value="Unemployed">Unemployed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                        <textarea name="message" value={form.message} onChange={handleChange} rows={3} className="w-full rounded-md border p-2"></textarea>
                    </div>

                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg justify-between items-center border">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Test AI Approval Predictor</p>
                            <p className={`text-sm mt-1 font-bold ${prediction === 'Loan Approved' ? 'text-indigo-700' : prediction === 'Loan Rejected' ? 'text-red-600' : 'text-gray-500'}`}>
                                {prediction || 'No prediction run yet'}
                            </p>
                        </div>
                        <Button type="button" variant="outline" onClick={handlePredict} disabled={isPredicting}>
                            {isPredicting ? 'Predicting...' : 'Run Analysis'}
                        </Button>
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                        Submit Application
                    </Button>
                </form>
            </div>
        </Container>
    );
}
