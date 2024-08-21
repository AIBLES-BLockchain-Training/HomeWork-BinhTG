import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetServiceFeeBalance = () => {
    const [serviceFeeBalance, setServiceFeeBalance] = useState<string | null>(null); // Lưu trữ số dư phí dịch vụ
    const [error, setError] = useState<string | null>(null); // Thêm state để lưu lỗi

    const getServiceFeeBalance = async () => {
        try {
            // Gọi hàm serviceFeeBalance từ hợp đồng
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'serviceFeeBalance',
            });

            // Xác định kiểu dữ liệu trả về và chuyển đổi nếu cần
            const balance = (result as bigint).toString(); // Chuyển đổi từ bigint thành string
            setServiceFeeBalance(balance);
            setError(null); // Reset lỗi nếu thành công
        } catch (error) {
            console.error('Error fetching service fee balance:', error);
            setError('Failed to fetch service fee balance'); // Cập nhật lỗi nếu có
        }
    }

    return (
        <div className="form-container">
            <h2>Get Service Fee Balance</h2>
            <button type='button' onClick={getServiceFeeBalance}>Get Balance</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="balance">
                <h6>Service Fee Balance: {serviceFeeBalance !== null ? serviceFeeBalance : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetServiceFeeBalance;
