'use server'
import React from 'react'
import Fleet from '../[lang]/home/fleet';

export default async function GetFlets() {
    const response = await fetch(`${process.env.API_URL}api/vehicles/vehicle-categories/`, {
        credentials: 'include',
        method: 'GET',
        headers: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        
      });
    const fleets = await response.json();
    if (response.status != 200)
        return
    return (
        <div>
            {
                fleets.map((viecle)=>(
                    <Fleet title={viecle.name_category} key={viecle.id} image={viecle.image_path}/>
                ))
            }
        </div>
    )
}
