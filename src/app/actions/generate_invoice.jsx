import React from 'react'

export async function GenerateInvoice(driverID, startDate, endDate, status, preview) {
    const response = await fetch(`/api/generate_invoice`, {
        method: "POST",
        Credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_driver: driverID,
            from_date: startDate,
            to_date: endDate,
            status: status,
            amount_paid: null,
            datetime_paid: null,
            preview: preview
        }),
    });

    if (response.status === 200) {
        const data = await response.json();
        return {status: response.status , data:data}
    }
    return {status: response.status , data:null}
}
