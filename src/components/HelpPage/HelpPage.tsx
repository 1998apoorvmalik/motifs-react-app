import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import styles from './HelpPage.module.css';

const base = process.env.PUBLIC_URL || '';

const files = [
  { id: 'overview', title: 'Overview', path: `${base}/help-docs/overview.md` },
  { id: 'motif-view', title: 'Motif View Page', path: `${base}/help-docs/motif-view.md` },
  { id: 'structure-view', title: 'Structure View Page', path: `${base}/help-docs/structure-view.md` },
  { id: 'input-structure', title: 'Input New Structure', path: `${base}/help-docs/input-structure.md` },
  { id: 'contact-and-papers', title: 'Contact & Papers', path: `${base}/help-docs/contact-and-papers.md` },
];

const HelpPage: React.FC = () => {
  const [sections, setSections] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showTop, setShowTop] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all(
      files.map(file =>
        fetch(file.path)
          .then(res => res.text())
          .then(text => ({ id: file.id, content: text }))
      )
    ).then(results => {
      const contentMap: Record<string, string> = {};
      const expandedMap: Record<string, boolean> = {};
      results.forEach(({ id, content }) => {
        contentMap[id] = content;
        expandedMap[id] = true;
      });
      setSections(contentMap);
      setExpanded(expandedMap);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const toggleSection = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFiles = files.filter(file => {
    const content = sections[file.id] || '';
    return (
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>RNA Motif Server (Help & Documentation)</div>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <h3>Table of Contents</h3>
          <ul>
            {filteredFiles.map(file => (
              <li key={file.id}>
                <button onClick={() => handleScrollToSection(file.id)} className={styles.tocLink}>
                  {file.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className={styles.content}>
          <div className={styles.searchBox}>
            <i className={`fas fa-search ${styles.searchIcon}`} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search help docs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredFiles.map(file => (
            <section key={file.id} id={file.id} className={styles.docSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection(file.id)}>
                <span>{file.title}</span>
                <span className={styles.toggleIcon}>
                  {expanded[file.id] ? '−' : '+'}
                </span>
              </div>
              {expanded[file.id] && (
                <div className={styles.markdownContent}>
                  <ReactMarkdown
                    children={sections[file.id] || ''}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
                  />
                </div>
              )}
            </section>
          ))}
        </main>
      </div>

      {showTop && (
        <button
          className={styles.backToTop}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑ Back to Top
        </button>
      )}
    </div>
  );
};

export default HelpPage;
