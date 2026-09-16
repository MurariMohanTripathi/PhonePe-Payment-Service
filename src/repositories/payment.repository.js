const pool =require("../config/database");
const createPayment = async({
    merchantOrderId,
    amount,
    redirectUrl,
})=>{
    const query=`
    INSERT INTO payments(
    merchant_order_id,
    amount,
    redirect_url,
    status
    )
    VALUES($1,$2,$3,$4)
    RETURNING *
    `;
    const values = [
        merchantOrderId,
        amount,
        redirectUrl,
        "CREATED",
    ];
    
    const result = await pool.query(query,values);
    
    return result.rows[0];
}

const updatePaymentAfterPhonePeCreation = async({
        merchantOrderId,
        phonePeOrderId,
        status,
})=>{
        const query = `
               UPDATE payments
               SET
                 phonepe_order_id = $1,
                 status = $2,
                 updated_at = NOW()
               WHERE merchant_order_id = $3
               RETURNING *
               `;
        const values = [phonePeOrderId,status,merchantOrderId];
        const result = await pool.query(query,values);
        return result.rows[0];
};
const findByMerchantOrderId = async (merchantOrderId) =>{
    const query =`
    SELECT * 
    FROM payments
    WHERE merchant_order_id = $1
    `;
    const result = await pool.query(query,[merchantOrderId]);
    return result.rows[0] || null;
};
const updatePaymentStatus = async({
    merchantOrderId,
    status,
})=>{
        const query = `
      UPDATE payments
      SET
        status = $1,
        updated_at = NOW()
      WHERE merchant_order_id = $2
      RETURNING *
    `;
    const result = await pool.query(
        query,
        [
            status,
            merchantOrderId,
        ]
    );
    return result.rows[0];
};
module.exports = {
    createPayment,
    updatePaymentAfterPhonePeCreation,
    findByMerchantOrderId,
    updatePaymentStatus,
};