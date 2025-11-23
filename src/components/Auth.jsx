import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Auth = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    justify - content: center;
    min - height: 100vh;
    padding: var(--spacing - md);
}
        .auth - card {
    width: 100 %;
    max - width: 400px;
}
        .auth - form {
    display: flex;
    flex - direction: column;
    gap: var(--spacing - md);
}
        .form - group {
    display: flex;
    flex - direction: column;
    gap: var(--spacing - xs);
}
        .role - select {
    display: flex;
    gap: var(--spacing - sm);
}
        .role - select button {
    flex: 1;
}
`}</style>
        </div>
    );
};

export default Auth;
