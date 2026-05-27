import React, { useState, useEffect } from 'react';
import styles from '../../styles/pages/FAQPage.module.css';

const FAQPage = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openSections, setOpenSections] = useState({});
    const [openQuestions, setOpenQuestions] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResults, setFilteredResults] = useState({});

    // Данные FAQ (статические, можно вынести в отдельный файл)
    const faqData = [
        {
            category: 'courses',
            title: 'Courses and Teachers',
            icon: '🎓',
            items: [
                {
                    question: 'For what level of training are your courses suitable?',
                    answer: 'We have courses for all levels: from schoolchildren who are just starting to study mathematics in depth (for example, preparation for Olympiads) and students who want to improve the school curriculum (grades 5-11) to first-year students studying higher mathematics (mathematical analysis, linear algebra, etc.). Each course has a detailed description indicating the necessary initial knowledge.'
                },
                {
                    question: 'Who teaches the courses?',
                    answer: 'Our teachers are experienced teachers, graduates of leading universities (Mekhmat, Phystech), candidates of sciences, as well as practicing tutors with confirmed experience in preparing for the Unified State Exam, the Main State Exam and Olympiads. On the course pages you can see detailed resumes and diplomas of teachers.'
                },
                {
                    question: 'How do your courses differ from school lessons or a tutor?',
                    answer: 'Our courses are structured programs focused on specific goals (exam, Olympiad, complex topic). They combine the advantages of a systematic approach (as in school) and deep immersion (as with a tutor), but often at a more affordable price. We use interactive materials, an automated task checking system and provide recordings of all classes.'
                }
            ]
        },
        {
            category: 'learning',
            title: 'Learning Format',
            icon: '💻',
            items: [
                {
                    question: 'How are classes conducted?',
                    answer: 'Classes are held online in the format of live webinars with the ability to ask questions to the teacher in the chat or by voice. Each lesson is accompanied by a presentation, an interactive whiteboard and practical tasks. All classes are available in the recording in your personal account so that they can be reviewed at any time.'
                },
                {
                    question: 'What happens if I miss a class?',
                    answer: 'No problem! All classes are automatically recorded and appear in your personal account within a few hours after the end of the broadcast. You can watch the recording at a convenient time.'
                },
                {
                    question: 'Will there be homework and feedback?',
                    answer: 'Yes, after each lesson you receive homework. Some tasks are checked automatically by our system, and for complex tasks there is a check by a teacher or curator with detailed comments. You can always ask a question about your homework in the general course chat.'
                }
            ]
        },
        {
            category: 'payment',
            title: 'Payment and Technical',
            icon: '💳',
            items: [
                {
                    question: 'How does payment happen? Is there an installment plan?',
                    answer: 'You can pay for the course by card (Visa/Mastercard/Mir), through SBP or electronic wallets. For most long-term courses, we provide an interest-free installment plan from our partner banks. Detailed installment terms are indicated on the payment page.'
                },
                {
                    question: 'What is technically needed for classes?',
                    answer: 'You only need a computer, tablet or smartphone with stable Internet access to watch webinars. A browser is enough to complete tasks. There is no need to install special software. We recommend using a headset for better sound quality if you plan to ask questions by voice.'
                }
            ]
        },
        {
            category: 'results',
            title: 'Guarantees and Results',
            icon: '🏅',
            items: [
                {
                    question: 'Is it possible to get a refund if the course doesn\'t suit me?',
                    answer: 'Yes, we provide a guaranteed refund within the first 7 days after the start of the course (or after the first lesson for short intensives) if you understand that the course does not meet your expectations. To do this, you need to write to our support team.'
                },
                {
                    question: 'What result will I get after the course?',
                    answer: 'The result depends on the goals of the course. For example, after a course to prepare for the Unified State Exam, you will systematize your knowledge, practice solving all types of exam tasks and increase your average score on practice tests. At the end of the course, you receive a certificate (if you have completed at least 80% of the tasks), which can be added to your portfolio.'
                },
                {
                    question: 'Do you offer a trial lesson?',
                    answer: 'Yes! We regularly host free open lesson webinars on the most relevant topics. You can sign up for them on the main page of the site. Also, for some courses, the first paid lesson is available as a trial with the possibility of a refund if you don\'t like it.'
                }
            ]
        }
    ];

    // Инициализация состояний открытых секций и вопросов
    useEffect(() => {
        const initialOpenSections = {};
        const initialOpenQuestions = {};
        faqData.forEach(section => {
            initialOpenSections[section.category] = false;
            section.items.forEach((_, idx) => {
                initialOpenQuestions[`${section.category}-${idx}`] = false;
            });
        });
        setOpenSections(initialOpenSections);
        setOpenQuestions(initialOpenQuestions);
    }, []);

    // Фильтрация по поиску и категории
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredResults({});
            return;
        }
        const term = searchTerm.toLowerCase();
        const filtered = {};
        faqData.forEach(section => {
            const matchingItems = section.items.filter(item =>
                item.question.toLowerCase().includes(term) ||
                item.answer.toLowerCase().includes(term)
            );
            if (matchingItems.length > 0) {
                filtered[section.category] = matchingItems;
            }
        });
        setFilteredResults(filtered);
    }, [searchTerm]);

    const toggleSection = (category) => {
        setOpenSections(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const toggleQuestion = (category, idx) => {
        const key = `${category}-${idx}`;
        setOpenQuestions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setSearchTerm('');
        setFilteredResults({});
    };

    const getVisibleCategories = () => {
        if (searchTerm.trim()) {
            // При поиске показываем только категории, где есть совпадения
            return Object.keys(filteredResults);
        }
        return activeCategory === 'all'
            ? faqData.map(s => s.category)
            : [activeCategory];
    };

    const getVisibleQuestions = (section) => {
        if (searchTerm.trim()) {
            return filteredResults[section.category] || [];
        }
        return section.items;
    };

    const visibleCategories = getVisibleCategories();

    return (
        <div className={styles.faqContainer}>
            <h1 className={styles.title}>Frequently Asked Questions (FAQ)</h1>

            {/* Search */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Type your question or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                <i className={`fas fa-search ${styles.searchIcon}`}></i>
            </div>

            {/* Category tabs */}
            <div className={styles.categories}>
                <button
                    className={`${styles.categoryBtn} ${activeCategory === 'all' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('all')}
                >
                    All Questions
                </button>
                <button
                    className={`${styles.categoryBtn} ${activeCategory === 'courses' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('courses')}
                >
                    Courses and Teachers
                </button>
                <button
                    className={`${styles.categoryBtn} ${activeCategory === 'learning' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('learning')}
                >
                    Learning Format
                </button>
                <button
                    className={`${styles.categoryBtn} ${activeCategory === 'payment' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('payment')}
                >
                    Payment and Technical
                </button>
                <button
                    className={`${styles.categoryBtn} ${activeCategory === 'results' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('results')}
                >
                    Guarantees and Results
                </button>
            </div>

            {/* FAQ sections */}
            <div className={styles.faqSections}>
                {faqData.map(section => {
                    if (!visibleCategories.includes(section.category)) return null;
                    const visibleQuestions = getVisibleQuestions(section);
                    if (visibleQuestions.length === 0) return null;
                    const isSectionOpen = openSections[section.category];
                    return (
                        <div key={section.category} className={styles.faqSection}>
                            <div
                                className={styles.sectionHeader}
                                onClick={() => toggleSection(section.category)}
                            >
                                <div className={styles.sectionTitle}>
                                    <span className={styles.sectionIcon}>{section.icon}</span>
                                    <h2>{section.title}</h2>
                                </div>
                                <div className={`${styles.toggleIcon} ${isSectionOpen ? styles.rotated : ''}`}>
                                    ▼
                                </div>
                            </div>
                            {isSectionOpen && (
                                <div className={styles.sectionContent}>
                                    {visibleQuestions.map((item, idx) => {
                                        const key = `${section.category}-${idx}`;
                                        const isOpen = openQuestions[key];
                                        return (
                                            <div key={idx} className={styles.faqItem}>
                                                <div
                                                    className={styles.question}
                                                    onClick={() => toggleQuestion(section.category, idx)}
                                                >
                                                    <span>{item.question}</span>
                                                    <div className={`${styles.questionIcon} ${isOpen ? styles.rotated : ''}`}>
                                                        +
                                                    </div>
                                                </div>
                                                {isOpen && (
                                                    <div className={styles.answer}>
                                                        <p>{item.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
                {searchTerm && Object.keys(filteredResults).length === 0 && (
                    <div className={styles.noResults}>
                        <i className="fas fa-search"></i>
                        <p>No questions found. Try a different keyword.</p>
                    </div>
                )}
            </div>

            {/* Support link */}
            <div className={styles.supportLink}>
                <p>
                    <span>Didn't find an answer to your question? </span>
                    <a href="mailto:Mathjam_TechSupport@gmail.ru">Write to us</a>
                    <span> or call </span>
                    <a href="#">+7 900-000-00-00</a>
                </p>
            </div>
        </div>
    );
};

export default FAQPage;