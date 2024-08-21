import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetServiceFee = () => {
    const [serviceFee, setServiceFee] = useState<string | null>(null); // Lưu trữ phí dịch vụ
    const [error, setError] = useState<string | null>(null); // Thêm state để lưu lỗi

    const getServiceFee = async () => {
        try {
            // Gọi hàm serviceFee từ hợp đồng
            const result = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'serviceFee',
            });

            // Xác định kiểu dữ liệu trả về và chuyển đổi nếu cần
            const fee = (result as bigint).toString(); // Chuyển đổi từ bigint thành string
            setServiceFee(fee);
            setError(null); // Reset lỗi nếu thành công
        } catch (error) {
            console.error('Error fetching service fee:', error);
            setError('Failed to fetch service fee'); // Cập nhật lỗi nếu có
        }
    }

    return (
        <div className="form-container">
            <h2>Get Service Fee</h2>
            <button type='button' onClick={getServiceFee}>Get Fee</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="fee">
                <h6>Service Fee: {serviceFee !== null ? serviceFee : 'N/A'}</h6>
            </div>
        </div>
    );
};

export default GetServiceFee;
