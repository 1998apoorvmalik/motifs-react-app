import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type Motif from '../../interfaces/Motif';
import type Structure from '../../interfaces/Structure';
import GridItem from '../GridItem';
import Pagination from '../Pagination';
import ItemsPerPage from '../ItemsPerPage';
import MotifFilterDropdown from './MotifFilterDropdown';

const NAME_MAX = 80;     // reasonable UX cap
const EMAIL_MAX = 254;   // RFC max length for email

// Allow letters (incl. accents), marks, spaces, apostrophes, hyphens, periods
// Use a Latin Unicode range to cover common accented characters and remove the `u` flag
const NAME_ALLOWED_RE = /[^\u00C0-\u024Fa-zA-Z\s'.-]/g;
const EMAIL_DISALLOWED_RE = /\s/g;
const EMAIL_PATTERN = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'; // basic browser check

function sanitizeName(input: string) {
  return input
    .normalize('NFKC')
    .replace(NAME_ALLOWED_RE, '')     // strip illegal chars
    .replace(/\s+/g, ' ')             // collapse spaces
    .trim()
    .slice(0, NAME_MAX);
}

function sanitizeEmail(input: string) {
  return input
    .normalize('NFKC')
    .replace(EMAIL_DISALLOWED_RE, '') // no spaces
    .slice(0, EMAIL_MAX);
}

interface LocationState {
  motifs: Motif[];
  // Provide the input structure here when navigating to this page
  structure?: Structure | null;
}

const NewMotifsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [redirecting, setRedirecting] = useState(false);

  const motifs = useMemo(() => (location.state as LocationState)?.motifs || [], [location.state]);

  // The input structure in which motifs were found
  const structure: Structure | null = (location.state as LocationState)?.structure ?? null;

  // Calculate newMotifCount based on the original motifs array
  const newMotifCount = useMemo(() => motifs.filter(motif => motif.id === 'New').length, [motifs]);

  useEffect(() => {
    if (!location.state) {
      setRedirecting(true);
      setTimeout(() => navigate('/'), 2000);
    }
  }, [location.state, navigate]);

  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(v => !v);
  };

  // Filter motifs based on the selected filter
  const filteredMotifs = useMemo(() => {
    return motifs.filter(motif =>
      selectedFilter === 'New Motif'
        ? motif.id === 'New'
        : selectedFilter === 'Old Motif'
        ? motif.id !== 'New'
        : true
    );
  }, [motifs, selectedFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredMotifs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMotifs = filteredMotifs.slice(startIndex, endIndex);

  useEffect(() => {
    // Reset to first page when list size or page size changes
    setCurrentPage(1);
  }, [filteredMotifs.length, itemsPerPage]);

  const handleBackClick = () => {
    navigate('/');
  };

  // =========================
  // Ask-once inline save flow (save ALL new motifs)
  // =========================
  const newMotifs = useMemo(() => motifs.filter(m => m.id === 'New'), [motifs]);

  const [showConsent, setShowConsent] = useState(false);
  const [discovererName, setDiscovererName] = useState('');
  const [discovererEmail, setDiscovererEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Show the consent panel once when there are any new motifs
  useEffect(() => {
    if (newMotifs.length > 0) {
      setShowConsent(true);
      setDiscovererName('');
      setDiscovererEmail('');
      setSaveError(null);
    } else {
      setShowConsent(false);
    }
  }, [newMotifs.length]);

  // Placeholder saver: replace with your real API/services when ready
  async function saveAllNewMotifsPlaceholder(args: {
    motifs: Motif[];
    structure: Structure;
    discovererName?: string;
    discovererEmail?: string;
  }) {
    if (!args.structure) throw new Error('Input structure is required.');
    // Simulate save structure once
    await new Promise(r => setTimeout(r, 3000));
    console.log('Saving structure (placeholder):', args.structure);
    for (const m of args.motifs) {
      console.log('Saving motif (placeholder):', {
        motif: m,
        discovererName: args.discovererName,
        discovererEmail: args.discovererEmail,
      });
    }
  }

  const handleConsentNo = () => {
    setShowConsent(false);
  };

  const handleConsentYes = async () => {
    if (!structure) {
      setSaveError('Cannot save: input structure was not provided.');
      return;
    }
    try {
      setSaving(true);
      setSaveError(null);
      await saveAllNewMotifsPlaceholder({
        motifs: newMotifs,
        structure,
        discovererName: discovererName.trim() || undefined,
        discovererEmail: discovererEmail.trim() || undefined,
      });
      setShowConsent(false);
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save new motifs.');
    } finally {
      setSaving(false);
    }
  };

  if (redirecting) {
    return <h2>You cannot navigate to this page directly! Redirecting to homepage...</h2>;
  }

  return (
    <div>
      <button className="back-button" onClick={handleBackClick} style={{ marginTop: '16px' }}>
        {'< Back to All Motifs Page'}
      </button>

      <h2 style={{ textAlign: 'center' }}>
        {motifs.length > 0
          ? `Found ${motifs.length} (${newMotifCount} New) Undesignable ${
              motifs.length === 1 ? 'Motif' : 'Motifs'
            } in the Input Structure`
          : 'No Undesignable Motifs Found in the Input Structure!'}
      </h2>

      {/* Inline consent panel below the header; asks once to save ALL new motifs */}
      {showConsent && newMotifs.length > 0 && structure && (
        <div
          style={{
            margin: '12px auto 20px',
            width: 'min(960px, 50vw)',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            {!saving && (
              <>
                <strong>
                  {newMotifs.length} new {newMotifs.length === 1 ? 'motif' : 'motifs'} found
                </strong>
                <span>— Save all to database?</span>
              </>
            )}
            {saving && (
              <strong>
                Saving {newMotifs.length} new {newMotifs.length === 1 ? 'motif' : 'motifs'} to the
                database...
              </strong>
            )}
          </div>

          {/* Full-width inputs using your default input styles */}
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              placeholder="Your (Discoverer) Name (Optional)"
              value={discovererName}
              onChange={e => setDiscovererName(sanitizeName(e.target.value))}
              onPaste={e => {
                e.preventDefault();
                const text = e.clipboardData.getData('text') || '';
                setDiscovererName(sanitizeName(text));
              }}
              maxLength={NAME_MAX}
              disabled={saving}
              style={{ width: '100%' }}
              autoComplete="name"
              inputMode="text"
            />
            <input
              type="email"
              placeholder="Your (Discoverer) Email (Optional)"
              value={discovererEmail}
              onChange={e => setDiscovererEmail(sanitizeEmail(e.target.value))}
              onPaste={e => {
                e.preventDefault();
                const text = e.clipboardData.getData('text') || '';
                setDiscovererEmail(sanitizeEmail(text));
              }}
              maxLength={EMAIL_MAX}
              pattern={EMAIL_PATTERN} // browser will mark invalid if non-empty & not matching
              title="Enter a valid email like user@example.com"
              disabled={saving}
              style={{ width: '100%' }}
              autoComplete="email"
              inputMode="email"
            />
          </div>
          {!saving && (
            <div style={{ display: 'flex', gap: 0, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={handleConsentNo} className="reset-button" disabled={saving}>
                No
              </button>
              <button onClick={handleConsentYes} className="apply-button" disabled={saving}>
                {saving ? 'Saving…' : 'Yes'}
              </button>
            </div>
          )}
          {saveError ? <div style={{ color: '#b00020', marginTop: 8 }}>{saveError}</div> : null}
        </div>
      )}

      <div className="container">
        <div className="header-bar">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={page => setCurrentPage(page)}
          />
          <div className="centered-container">
            <MotifFilterDropdown
              isOpen={isFilterDropdownOpen}
              toggleDropdown={toggleFilterDropdown}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
            />
            <div style={{ marginLeft: '8px', marginRight: '16px' }}>
              <ItemsPerPage
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={value => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="grid-container"
          //   style={{
          //     gridTemplateColumns: "repeat(auto-fill, minmax(50%, 2fr))",
          //   }}
        >
          {currentMotifs.map((item, index) => (
            <GridItem
              key={index}
              item={item}
              height="30vh"
              onViewClick={item.id !== 'New' ? () => navigate(`/motif/${item.id}`) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewMotifsPage;
