import React, {useState, useEffect } from 'react';

const IntentManagement = () => {
    // State Management
    const [intents, setIntents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [examples, setExamples] = useState([]);
    const [testPhrase, setTestPhrase] = useState("");
    const [testResults, setTestResults] = useState(null);
    const [editingExampleId, setEditingExampleId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all intents
    useEffect(() => {
        const fetchIntents = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5005/domain", {
            headers: {
                "Accept": "application/json"
            }
            });

            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.intents) {
            setIntents(data.intents);
            setLoading(false);
            }
        } catch (error) {
            setError("Failed to fetch intents. Please try again later");
            setLoading(false);
            console.error("Error fetching intents:", error);
        }
        };

        fetchIntents();
    }, []);

    // Fetching examples when the intents are selected
    


}