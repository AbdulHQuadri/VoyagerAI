// Button function to test React integration

import React from 'react';

function Button({ label }) {
    return (
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {label}
        </button>
    );
}

export default Button;