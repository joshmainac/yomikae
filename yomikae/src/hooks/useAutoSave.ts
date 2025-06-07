import { useState, useEffect } from 'react'

export function useAutoSave(key: string, value: string){
    useEffect(()=>{
        localStorage.setItem(key, value)
    },[key, value])
}
