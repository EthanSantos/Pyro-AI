"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface AnimatedNumberProps {
    value: number
    duration?: number
    className?: string
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 300, className }) => {
    const [displayValue, setDisplayValue] = useState(value)

    useEffect(() => {
        const diff = value - displayValue
        if (diff === 0) return

        const steps = Math.floor(duration / 20)
        const stepIncrement = diff / steps
        let currentStep = 0
        const interval = setInterval(() => {
            currentStep++
            setDisplayValue((prev) => {
                const next = prev + stepIncrement
                if (currentStep >= steps) {
                    clearInterval(interval)
                    return value
                }
                return next
            })
        }, 20)
        return () => clearInterval(interval)
    }, [value, duration, displayValue])

    return <span className={className}>{Math.round(displayValue)}</span>
}

