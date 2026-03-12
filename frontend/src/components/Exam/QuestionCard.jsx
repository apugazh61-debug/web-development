import './QuestionCard.css';

const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
    return (
        <div className="question-card">
            <div className="section-badge">{question.section}</div>

            <div className="question-text">
                <span className="question-content">{question.question}</span>
            </div>

            <div className="options-container">
                {question.options.map((option, index) => (
                    <label
                        key={index}
                        className={`option ${selectedAnswer === index ? 'selected' : ''}`}
                    >
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={index}
                            checked={selectedAnswer === index}
                            onChange={() => onAnswerSelect(index)}
                        />
                        <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                        <span className="option-text">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
