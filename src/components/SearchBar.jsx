import { useState, useRef, useEffect } from 'react'
import { getSuggestions } from '../data/subjectAliases'

export default function SearchBar({ value, onChange, subjects }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (value && subjects) {
      setSuggestions(getSuggestions(value, subjects))
    } else {
      setSuggestions([])
    }
  }, [value, subjects])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={wrapperRef}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="text"
        placeholder="과목명, 교수명, 별칭(고비토, 물실 등)으로 검색..."
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-uos-blue/30 focus:border-uos-blue"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map(subject => (
            <li
              key={subject}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-uos-light cursor-pointer transition-colors"
              onMouseDown={() => {
                onChange(subject)
                setShowSuggestions(false)
              }}
            >
              {subject}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
