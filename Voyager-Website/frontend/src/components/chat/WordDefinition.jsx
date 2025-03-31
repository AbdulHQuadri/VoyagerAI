import React, {useState} from 'react';
import PropTypes from 'prop-types'

const WordDefinition = ({ word, definitionData }) => {
    const [showDefinition, setShowDefinition] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const {
        translations =  {},
        definition = "",
        partOfSpeech = "",
        pronunciation,
        examples = []
    } = definitionData || {};

    const userNativeLanguage = "en"; // Get this from the database later
    const translation = translations[userNativeLanguage] || ""; 

    const handleSaveWord = async () => {
        try{
            console.log(`Saving word "${word}" to personal dictionary`);
            setIsSaved(true);
        } catch (error) {
            console.error("Error saving word to dictionary: ", error); 
        }
    }


    return (
        <span 
            className="word-with-definition"
            onMouseEnter={() => setShowDefinition(true)}
            onMouseLeave={() => setShowDefinition(false)}
        >
            {word}
            {showDefinition && (
                <div className="word-definition-tooltip">
                    <div className="word-definition-content">
                        <div className="word-header">
                            <span className="word-original">{word}</span>
                            {partOfSpeech && <span className="word-part-of-speech">({partOfSpeech})</span>}
                            {pronunciation && <span className="word-pronunciation">[{pronunciation}]</span>}
                        </div>

                        {definition && <div className='word-definition'>{definition}</div>}

                        {translation && (
                            <div className='word-translation'>
                                <strong>Translation: </strong> {translation}
                            </div>
                        )}

                        {examples.length > 0 && (
                            <div className='word-examples'>
                                <strong>Examples: </strong>
                                <ul>
                                    {examples.map((example, index) => (
                                        <li key={index}>{example}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className='word-actions'>
                            <button 
                                className={`save-word-button ${isSaved ? 'saved' : ''}`}
                                onClick={handleSaveWord}
                                title="Add to my dictionary"
                            >
                                {isSaved ? '✓ Saved' : 'Add to my dictionary'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </span>
    );
};

WordDefinition.propTypes = {
    word: PropTypes.string.isRequired,
    definitionData: PropTypes.shape({
        translations: PropTypes.object,
        definition: PropTypes.string,
        partOfSpeech: PropTypes.string,
        pronunciation: PropTypes.string,
        examples: PropTypes.arrayOf(PropTypes.string)
    })
};

export default WordDefinition;