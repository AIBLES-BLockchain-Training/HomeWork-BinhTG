import React, { useState } from 'react';
import { publicClient } from '../../../client'; 
import { contract } from '../LendingPoolAbi'; 
import { Address } from 'viem';
import '../../CollateralManager/Function.css'; 

const GetAllowedTokens = () => {
    const [allowedTokens, setAllowedTokens] = useState<string[]>([]); // Mảng để lưu trữ các địa chỉ token
    const [error, setError] = useState<string | null>(null); // State để lưu lỗi

    const getAllowedTokens = async () => {
        try {
            // Gọi hàm getAllowedTokens từ hợp đồng
            const tokens = await publicClient.readContract({
                abi: contract.abi,
                address: contract.address as Address,
                functionName: 'getAllowedTokens',
            });
            
            setAllowedTokens(tokens as string[]);
            setError(null); // Reset lỗi nếu thành công
        } catch (error) {
            console.error('Error fetching allowed tokens:', error);
            setError('Failed to fetch tokens'); // Cập nhật lỗi nếu có
        }
    }

    return (
        <div className="form-container">
            <h2>Get Allowed Tokens</h2>
            <button type='button' onClick={getAllowedTokens}>Get Tokens</button>
            {error && <p className="error">{error}</p>} {/* Hiển thị lỗi nếu có */}
            <div className="tokens">
                {allowedTokens.length > 0 ? (
                    allowedTokens.map((token, index) => (
                        <div key={index} className="token-info">
                            <h6>Token {index + 1}: {token}</h6>
                        </div>
                    ))
                ) : (
                    <p></p> // Thay thế nội dung nếu không có token
                )}
            </div>
        </div>
    );
};

export default GetAllowedTokens;
