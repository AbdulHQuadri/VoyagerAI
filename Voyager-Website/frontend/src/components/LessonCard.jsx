import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lessonService from "../services/lessonService";
import "../assets/LessonCard.css";


function LessonCards() {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [languages, setLanguages] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch lessons on component mount
    useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await lessonService.getAllLessons();
            const lessonData = response.data || [];
            console.log(lessonData);
            setLessons(lessonData);
            setFilteredLessons(lessonData);
            
            // Extract unique languages and levels for filters
            const uniqueLanguages = [...new Set(lessonData.map(lesson => lesson.language))];
            const uniqueLevels = [...new Set(lessonData.map(lesson => lesson.level))];

            setLanguages(uniqueLanguages);
            setLevels(uniqueLevels);
            setError(null);
        } catch(error) {
            console.error("Error fetching lessons:" , error);
            setError("Failed to load available lessons");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
    }, []);

     // Filter lessons when search query or filters change
  useEffect(() => {
    const filterLessons = () => {
        let results = lessons;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(lesson => 
          lesson.title?.toLowerCase().includes(query) || 
          lesson.description?.toLowerCase().includes(query)
        );
      }
      
      // Filter by language
      if (selectedLanguage !== "all") {
        results = results.filter(lesson => lesson.language === selectedLanguage);
      }
      
      // Filter by level
      if (selectedLevel !== "all") {
        results = results.filter(lesson => lesson.level === selectedLevel);
      }
      
      setFilteredLessons(results);
    };
    
    filterLessons();
  }, [searchQuery, selectedLanguage, selectedLevel, lessons]);

  const handleStartLesson = (lesson) => {
    navigate(`/chat?lesson=${lesson.name}`);
  };

  if (loading) return (
    <div className="lessons-loading">
      <div className="loader"></div>
      <p>Loading available lessons...</p>
    </div>
  );
  
  if (error) return <div className="lessons-error">{error}</div>;
  
  const renderDurationLabel = (minutes) => {
    if (!minutes) return "Quick practice";
    if (minutes < 15) return "< 15 min";
    if (minutes < 30) return "< 30 min";
    return `${Math.floor(minutes/30) * 30}+ min`;
  };

  return (
    <div className="lessons-container">
      <div className="lessons-header">
        <h2>Choose a Language Lesson</h2>
        <p>Select from our collection of conversational lessons</p>
      </div>

      <div className="lessons-search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filters">
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredLessons.length > 0 ? (
        <div className="lessons-grid">
          {filteredLessons.map(lesson => (
            <div 
              key={lesson.lesson_id} 
              className="lesson-card"
              onClick={() => handleStartLesson(lesson)}
            >
              <div className="lesson-card-image">
                {lesson.image_url ? (
                  <img src={lesson.image_url} alt={lesson.title} />
                ) : (
                  <div className="lesson-card-image-placeholder">
                    <span>{lesson.language?.charAt(0)}</span>
                  </div>
                )}
                <div className="lesson-card-level">{lesson.level}</div>
              </div>
              
              <div className="lesson-card-content">
                <h3>{lesson.title}</h3>
                <p className="lesson-card-description">{lesson.description}</p>
                <div className="lesson-card-details">
                  <span className="lesson-card-language">{lesson.language}</span>
                  <span className="lesson-card-duration">
                    {renderDurationLabel(lesson.estimated_duration)}
                  </span>
                </div>
              </div>
              
              <button className="lesson-card-button">Start Lesson</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-lessons">
          <p>No lessons match your search criteria.</p>
          <button onClick={() => {
            setSearchQuery("");
            setSelectedLanguage("all");
            setSelectedLevel("all");
          }}>Clear Filters</button>
        </div>
      )}
    </div>
  );
}

export default LessonCards;

