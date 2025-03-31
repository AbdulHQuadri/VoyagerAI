import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lessonService from "../services/lessonService";

function ChatButton() {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);
                const response = await lessonService.getAllLessons();
                setLessons(response.data || []);
                
                // Set first lesson as default if available
                if (response.data && response.data.length > 0) {
                    setSelectedLesson(response.data[0].name);
                }
                
                setError(null);
            } catch (err) {
                console.error("Error fetching lessons:", err);
                setError("Failed to load available lessons");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    const handleStartChat = () => {
        if (selectedLesson) {
            navigate(`/chat?lesson=${selectedLesson}`);
        }
    };

    if (loading) return <div>Loading available lessons...</div>;
    if (error) return <div className="error-message">{error}</div>;
    
    return (
        <div className="chat-button-container">
            <h2>Select a Lesson</h2>
            
            {lessons.length > 0 ? (
                <>
                    <select 
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        className="lesson-selector"
                    >
                        {lessons.map(lesson => (
                            <option key={lesson.name} value={lesson.name}>
                                {lesson.title || lesson.name}
                            </option>
                        ))}
                    </select>
                    
                    <button 
                        onClick={handleStartChat} 
                        className="chat-button"
                        disabled={!selectedLesson}
                    >
                        Start Lesson
                    </button>
                </>
            ) : (
                <p>No lessons available at this time.</p>
            )}
        </div>
    );
}

export default ChatButton;