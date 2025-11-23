import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * A reusable, professional search bar component.
 * @param {string} searchQuery - The current value of the search input.
 * @param {function} setSearchQuery - The state setter function to update the search query.
 * @param {string} placeholder - The placeholder text for the input field.
 */
const SearchBar = ({ searchQuery, setSearchQuery, placeholder }) => {
    return (
        <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
                id="search"
                name="search"
                className="block w-full rounded-md border-0 bg-white py-2.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder={placeholder}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;