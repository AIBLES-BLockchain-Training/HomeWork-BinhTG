import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetBorrowedAndSupplied = () => {
    const [address, setAddress] = useState<string>(''); // Lưu trữ địa chỉ nhập vào
    const [totalBorrowed, setTotalBorrowed] = useState<string | null>(null); // Lưu trữ tổng số tiền đã vay
    const [totalSupplied, setTotalSupplied] = useState<string | null>(null); // Lưu trữ tổng số tiền đã cung cấp
    const [error, setError] = useState<string | null>(null); // Thêm state để lưu lỗi

    const getBorrowedAndSupplied = async () => {
        try {
            const [borrowed, supplied] = await Promise.all([
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'totalBorrowed',
                    args: [address],
                }),
                publicClient.readContract({
                    abi: contract.abi,
                    address: contract.address as Address,
                    functionName: 'totalSupplied',
                    args: [address],
                }),
            ]);

            // Chuyển đổi từ bigint thành string
            setTotalBorrowed((borrowed as bigint).toString());
            setTotalSupplied((supplied as bigint).toString());
            setError(null); // Reset lỗi nếu thành công
        } catch (error) {
            console.error('Error fetching borrowed and supplied amounts:', error);
            setError('Failed to fetch data'); // Cập nhật lỗi nếu có
        }
    }

    return (
        <div className="form-container">
            <h2>Get Borrowed and Supplied Amounts</h2>
            <div className="input-container">
                <label htmlFor="address">Token Address:</label>
                <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)} 
                    //placeholder="0x..."
                />
            </div>
            <button type='button' onClick={getBorrowedAndSupplied}>Get Data</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="amounts">
                <h6>Total Borrowed: {totalBorrowed !== null ? totalBorrowed : 'N/A'}</h6>
                <h6>Total Supplied: {totalSupplied !== null ? totalSupplied : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetBorrowedAndSupplied;
