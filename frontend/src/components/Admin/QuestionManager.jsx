import { useState, useEffect, useCallback, useRef } from 'react';
import API_BASE_URL_CENTRAL from '../../config';

const API_BASE_URL = `${API_BASE_URL_CENTRAL}/api/admin`;

export const parseQuestionsText = (questionsText, answersText, defaultSection = 'General') => {
    if (!questionsText || !questionsText.trim()) return [];

    // Parse answers
    const parsedAnswers = [];
    if (answersText && answersText.trim()) {
        const rawAnswers = answersText.trim();
        const indexedAnswers = {};
        const indexRegex = /(?:(\d+)[\.:\-\)\s]+([A-Za-z0-9அஆஇஈ\u0B80-\u0BFF\s\w]+))/g;
        let match;
        let hasNumberedAnswers = false;
        while ((match = indexRegex.exec(rawAnswers)) !== null) {
            const num = parseInt(match[1], 10);
            const val = match[2].trim();
            indexedAnswers[num] = val;
            hasNumberedAnswers = true;
        }

        if (hasNumberedAnswers && Object.keys(indexedAnswers).length > 1) {
            const maxNum = Math.max(...Object.keys(indexedAnswers).map(Number));
            for (let i = 1; i <= maxNum; i++) {
                parsedAnswers.push(indexedAnswers[i] || '');
            }
        } else {
            const lines = rawAnswers.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
            for (const line of lines) {
                const cleanAns = line.replace(/^(?:Q\d+|கேள்வி\s*\d+|\d+)[\.:\-\)\s]*/i, '').trim();
                parsedAnswers.push(cleanAns || line);
            }
        }
    }

    // Split blocks by question numbering or double newlines
    const rawBlocks = questionsText
        .split(/(?=(?:^|\n)\s*(?:\d+[\.\)]|Q\d+[\.:\)]|கேள்வி\s*\d+[\.:\)]))\s*/i)
        .map(b => b.trim())
        .filter(Boolean);

    const blocks = rawBlocks.length > 0 ? rawBlocks : questionsText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

    const result = [];

    blocks.forEach((block, qIdx) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        let qText = lines[0].replace(/^(?:Q\d+|கேள்வி\s*\d+|\d+)[\.:\-\)\s]*/i, '').trim();
        const options = [];
        let lineIndex = 1;

        const optionPrefixRegex = /^(?:[A-Da-d1-4அஆஇஈ]|\([A-Da-d1-4அஆஇஈ]\))[\.:\-\)\s]+/;

        for (; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            if (optionPrefixRegex.test(line)) {
                options.push(line.replace(optionPrefixRegex, '').trim());
            } else if (options.length === 0) {
                qText += ' ' + line;
            } else {
                if (options.length < 4) {
                    options.push(line.trim());
                } else {
                    options[options.length - 1] += ' ' + line;
                }
            }
        }

        // If no options matched with prefix, take lines 1..4 as options
        if (options.length === 0 && lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
                options.push(lines[i].trim());
            }
        }

        // Map answer index
        let answerIndex = 0;
        const answerRaw = parsedAnswers[qIdx] || parsedAnswers[0] || '';

        if (answerRaw) {
            const ansNormalized = answerRaw.trim().toUpperCase();
            if (ansNormalized === 'A' || ansNormalized === '1' || ansNormalized === 'அ') answerIndex = 0;
            else if (ansNormalized === 'B' || ansNormalized === '2' || ansNormalized === 'ஆ') answerIndex = 1;
            else if (ansNormalized === 'C' || ansNormalized === '3' || ansNormalized === 'இ') answerIndex = 2;
            else if (ansNormalized === 'D' || ansNormalized === '4' || ansNormalized === 'ஈ') answerIndex = 3;
            else {
                const foundIdx = options.findIndex(opt =>
                    opt.toLowerCase().trim() === answerRaw.toLowerCase().trim() ||
                    opt.toLowerCase().includes(answerRaw.toLowerCase().trim())
                );
                if (foundIdx !== -1) {
                    answerIndex = foundIdx;
                } else {
                    const num = parseInt(answerRaw, 10);
                    if (!isNaN(num) && num >= 1 && num <= options.length) {
                        answerIndex = num - 1;
                    }
                }
            }
        }

        if (qText && options.length > 0) {
            result.push({
                section: defaultSection,
                question: qText,
                options: options,
                correctAnswer: answerIndex < options.length ? answerIndex : 0
            });
        }
    });

    return result;
};

const QuestionManager = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [questionsInput, setQuestionsInput] = useState('');
    const [answersInput, setAnswersInput] = useState('');
    const [sectionInput, setSectionInput] = useState('Technical');
    const [replaceAll, setReplaceAll] = useState(false);
    const [previewList, setPreviewList] = useState([]);
    const [showImportBox, setShowImportBox] = useState(false);

    // Edit modal state
    const [editingQuestion, setEditingQuestion] = useState(null);

    const fileInputRef = useRef(null);

    const showMessage = (text, type = 'success') => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
    };

    // Fetch questions from API
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/questions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to fetch questions');
            }
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (err) {
            console.error('Fetch questions error:', err);
            showMessage(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // Handle preview
    const handlePreview = () => {
        if (!questionsInput.trim()) {
            showMessage('Please enter question(s) with options in the first text box', 'error');
            return;
        }
        const parsed = parseQuestionsText(questionsInput, answersInput, sectionInput);
        if (parsed.length === 0) {
            showMessage('Could not parse questions. Please check the format.', 'error');
            return;
        }
        setPreviewList(parsed);
        showMessage(`Successfully parsed ${parsed.length} question(s)! Check preview below.`, 'success');
    };

    // Handle Save / Bulk Upload
    const handleSaveQuestions = async () => {
        const toSave = previewList.length > 0
            ? previewList
            : parseQuestionsText(questionsInput, answersInput, sectionInput);

        if (toSave.length === 0) {
            showMessage('Please enter questions to save or preview first.', 'error');
            return;
        }

        if (replaceAll && !window.confirm('WARNING: You selected "Replace All Questions". This will delete all existing questions. Are you sure?')) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/questions/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questions: toSave,
                    replaceAll
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to save questions');
            }

            const data = await res.json();
            showMessage(data.message || 'Questions saved successfully!', 'success');
            setQuestionsInput('');
            setAnswersInput('');
            setPreviewList([]);
            setShowImportBox(false);
            fetchQuestions();
        } catch (err) {
            console.error('Save questions error:', err);
            showMessage(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // File Upload Handler (.txt or .json)
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            try {
                // If JSON format
                if (file.name.endsWith('.json')) {
                    const parsedJson = JSON.parse(content);
                    if (Array.isArray(parsedJson)) {
                        setPreviewList(parsedJson);
                        showMessage(`Loaded ${parsedJson.length} questions from JSON!`, 'success');
                        return;
                    }
                }
            } catch {
                // Not valid JSON, treat as text
            }
            // Treat as text
            setQuestionsInput(content);
            showMessage('File contents loaded into Questions box! Now enter answers and preview.', 'success');
        };
        reader.readAsText(file);
    };

    // Delete single question
    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to delete question');
            }
            showMessage('Question deleted successfully.', 'success');
            fetchQuestions();
        } catch (err) {
            console.error('Delete question error:', err);
            showMessage(err.message, 'error');
        }
    };

    // Clear all questions
    const handleClearAll = async () => {
        if (!window.confirm('CRITICAL: Are you sure you want to delete ALL questions? Candidates will not be able to take exam until questions are added.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/questions`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to clear questions');
            }
            showMessage('All questions cleared successfully.', 'success');
            fetchQuestions();
        } catch (err) {
            console.error('Clear questions error:', err);
            showMessage(err.message, 'error');
        }
    };

    // Save edited question
    const handleUpdateQuestion = async (e) => {
        e.preventDefault();
        if (!editingQuestion) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/questions/${editingQuestion.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    section: editingQuestion.section,
                    question: editingQuestion.question,
                    options: editingQuestion.options,
                    correctAnswer: editingQuestion.correctAnswer
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to update question');
            }

            showMessage('Question updated successfully!', 'success');
            setEditingQuestion(null);
            fetchQuestions();
        } catch (err) {
            console.error('Update question error:', err);
            showMessage(err.message, 'error');
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="admin-card questions-manager-panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2>📝 Question Management ({questions.length})</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                        Add, edit, or delete questions in English or தமிழ் with options and answer keys
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn-primary"
                        onClick={() => setShowImportBox(!showImportBox)}
                        style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#000', fontWeight: 'bold' }}
                    >
                        {showImportBox ? '✖ Close Add Box' : '➕ Add / Change Questions'}
                    </button>
                    {questions.length > 0 && (
                        <button className="btn-danger btn-small" onClick={handleClearAll}>
                            🗑️ Delete All Questions
                        </button>
                    )}
                </div>
            </div>

            {statusMsg.text && (
                <div className={`message ${statusMsg.type}`} style={{ margin: '15px 0' }}>
                    {statusMsg.text}
                </div>
            )}

            {/* ADD / BULK IMPORT BOX */}
            {showImportBox && (
                <div className="questions-import-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ margin: 0, color: '#ffb703', fontSize: '18px' }}>
                            📥 Paste Questions & Answers (Text / File)
                        </h3>
                        <div>
                            <input
                                type="file"
                                accept=".txt,.json"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ fontSize: '13px', padding: '6px 14px' }}
                            >
                                📂 Upload .txt / .json File
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>
                                Section Name:
                            </label>
                            <input
                                type="text"
                                value={sectionInput}
                                onChange={(e) => setSectionInput(e.target.value)}
                                placeholder="e.g. Technical, General, தமிழ்"
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', color: '#fff' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={replaceAll}
                                    onChange={(e) => setReplaceAll(e.target.checked)}
                                />
                                <span>Replace all existing questions in database</span>
                            </label>
                        </div>
                    </div>

                    {/* TWO TEXT BOXES */}
                    <div className="question-textboxes-grid">
                        {/* TEXT BOX 1: Question with Options */}
                        <div className="textbox-wrapper">
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#00f2fe', marginBottom: '6px' }}>
                                📄 Text Box 1: Questions with Options (கேள்வி & தெரிவுகள்)
                            </label>
                            <textarea
                                rows="12"
                                value={questionsInput}
                                onChange={(e) => setQuestionsInput(e.target.value)}
                                placeholder={`Paste 1 or more questions with options here.\nSupports English or தமிழ்!\n\nExample 1 (English):\n1. What is Python?\nA) A programming language\nB) A car\nC) An OS\nD) A bird\n\nExample 2 (தமிழ்):\n2. ஜாவா என்றால் என்ன?\nA) நிரலாக்க மொழி\nB) கணினி\nC) உலாவி\nD) விளையாட்டு`}
                                className="question-textarea"
                            />
                            <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                Format: Question on top, options labeled A, B, C, D (or 1, 2, 3, 4 or அ, ஆ, இ, ஈ)
                            </small>
                        </div>

                        {/* TEXT BOX 2: Answers */}
                        <div className="textbox-wrapper">
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#4ade80', marginBottom: '6px' }}>
                                🔑 Text Box 2: Answers (விடைகள்)
                            </label>
                            <textarea
                                rows="12"
                                value={answersInput}
                                onChange={(e) => setAnswersInput(e.target.value)}
                                placeholder={`Enter answers corresponding to the questions.\n\nFormats accepted:\n• A, B, C, D\n• 1. A\n  2. B\n• A\n  B\n• Option text: நிரலாக்க மொழி`}
                                className="question-textarea"
                            />
                            <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                Can be comma-separated (A, B, C) or numbered (1. A, 2. B) or option text
                            </small>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handlePreview}
                            style={{ background: 'rgba(255, 183, 3, 0.2)', border: '1px solid #ffb703', color: '#ffb703' }}
                        >
                            🔍 Preview Parsed Questions
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSaveQuestions}
                            disabled={loading}
                            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}
                        >
                            {loading ? 'Saving...' : '💾 Save Questions to Database'}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setQuestionsInput('');
                                setAnswersInput('');
                                setPreviewList([]);
                            }}
                        >
                            Clear Inputs
                        </button>
                    </div>

                    {/* Live Preview List */}
                    {previewList.length > 0 && (
                        <div className="preview-container" style={{ marginTop: '24px' }}>
                            <h4 style={{ color: '#38bdf8', marginBottom: '10px' }}>
                                📋 Preview of Parsed Questions ({previewList.length}):
                            </h4>
                            <div className="preview-cards-list">
                                {previewList.map((item, idx) => (
                                    <div key={idx} className="preview-item-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#ffb703' }}>#{idx + 1}</span>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>[{item.section}]</span>
                                        </div>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#fff' }}>{item.question}</p>
                                        <div className="preview-options-grid">
                                            {item.options.map((opt, oIdx) => (
                                                <div
                                                    key={oIdx}
                                                    className={`preview-option-pill ${oIdx === item.correctAnswer ? 'correct' : ''}`}
                                                >
                                                    <span style={{ fontWeight: 'bold' }}>{optionLabels[oIdx]}.</span> {opt}
                                                    {oIdx === item.correctAnswer && <span style={{ marginLeft: '6px' }}>✔ Correct</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SEARCH AND LIST OF QUESTIONS */}
            <div style={{ margin: '1.5rem 0 1rem 0' }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search questions by text or section..."
                    style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        fontSize: '14px'
                    }}
                />
            </div>

            {loading && questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Loading questions...
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <p style={{ fontSize: '16px', color: '#cbd5e1', margin: 0 }}>
                        {searchQuery ? 'No matching questions found.' : 'No questions in database. Click "➕ Add / Change Questions" above to paste or load questions.'}
                    </p>
                </div>
            ) : (
                <div className="questions-list-grid">
                    {filteredQuestions.map((q, index) => (
                        <div key={q.id} className="question-item-card">
                            <div className="q-card-header">
                                <span className="q-number">#{index + 1}</span>
                                <span className="q-section-badge">{q.section || 'General'}</span>
                                <div className="q-card-actions">
                                    <button
                                        type="button"
                                        className="btn-action edit"
                                        onClick={() => setEditingQuestion({ ...q })}
                                        title="Edit this question"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action delete"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        title="Delete this question"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>

                            <p className="q-text">{q.question}</p>

                            <div className="q-options-list">
                                {Array.isArray(q.options) && q.options.map((opt, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`q-option-item ${optIndex === q.correctAnswer ? 'is-correct' : ''}`}
                                    >
                                        <span className="opt-letter">{optionLabels[optIndex] || optIndex + 1}.</span>
                                        <span className="opt-text">{opt}</span>
                                        {optIndex === q.correctAnswer && (
                                            <span className="opt-correct-tag">✔ Correct Answer</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT QUESTION MODAL */}
            {editingQuestion && (
                <div className="admin-modal-overlay" onClick={() => setEditingQuestion(null)}>
                    <div className="admin-modal-card" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div className="admin-shield-icon">✏️</div>
                            <h2>Edit Question #{editingQuestion.id}</h2>
                            <p>Update question text, options, and correct answer</p>
                        </div>

                        <form onSubmit={handleUpdateQuestion}>
                            <div className="form-group">
                                <label>Section</label>
                                <input
                                    type="text"
                                    value={editingQuestion.section || ''}
                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, section: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Question Text (supports English & தமிழ்)</label>
                                <textarea
                                    rows="3"
                                    value={editingQuestion.question || ''}
                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Options & Correct Answer</label>
                                {editingQuestion.options.map((opt, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <input
                                            type="radio"
                                            name="editCorrectAnswer"
                                            checked={editingQuestion.correctAnswer === idx}
                                            onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: idx })}
                                            title="Mark as correct answer"
                                        />
                                        <span style={{ fontWeight: 'bold', width: '25px', color: '#ffb703' }}>
                                            {optionLabels[idx]}:
                                        </span>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const updatedOptions = [...editingQuestion.options];
                                                updatedOptions[idx] = e.target.value;
                                                setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                                            }}
                                            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="admin-modal-actions">
                                <button type="submit" className="btn-primary admin-btn">
                                    💾 Save Changes
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setEditingQuestion(null)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionManager;
