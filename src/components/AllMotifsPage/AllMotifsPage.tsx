// src/components/AllMotifsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Motif from '../../interfaces/Motif';
import { ItemsPageState } from '../../interfaces/ItemsPageState';
import { motifService } from '../../services/motifService';
import SearchBar from '../SearchBar';
import FamilyFilterDropdown from '../FamilyFilterDropdown';
import SortDropdown from './SortDropdown';
import Pagination from '../Pagination';
import ItemsPerPage from '../ItemsPerPage';
import MotifItem from '../GridItem';
import NewStructureInput from './../NewStructureInput';
import LoadingSpinner from '../LoadingSpinnner';
import FindNewMotifsProgress from './FindNewMotifsProgress';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import Structure from '../../interfaces/Structure';
import { structureService } from '../../services/structureService';
import MotifListItem from './MotifListItem';
import StructureListItem from './StructureListItem';
import { familyMapping } from '../../constants/familyMapping';

import styles from './styles.module.css';

const AllMotifsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // motifs or structures view
  const [itemType, setItemType] = useState<'motifs' | 'structs'>('motifs');

  const restoredItemsPageState = (location.state as ItemsPageState) || {};
  const initialViewMode = restoredItemsPageState.viewMode || 'grid';
  const initialCurrentPage = restoredItemsPageState.currentPage || 1;
  const initialItemsPerPage = restoredItemsPageState.itemsPerPage || 30;
  const initialSearchQuery = restoredItemsPageState.searchQuery || '';
  const initialSelectedFilters =
    restoredItemsPageState.selectedFilters ||
    (itemType === 'motifs' ? familyMapping.map(item => item.value) : ['eterna', '5s']);
  const initialSelectedSort =
    restoredItemsPageState.selectedSort ||
    (itemType === 'motifs' ? 'Number of Families' : 'Number of Motifs');
  const initialSortOrder = restoredItemsPageState.sortOrder || 'desc';

  const [selectedFilters, setSelectedFilters] = useState<string[]>(initialSelectedFilters);

  const [isSortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>(initialSelectedSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const toggleSortDropdown = () => setSortOpen(!isSortOpen);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [items, setItems] = useState<Motif[] | Structure[]>([]); // State to store the fetched motifs
  const [totalPages, setTotalPages] = useState(1); // State for total number of pages

  // New Structure Process States
  const [response, setResponse] = useState<{
    motifs: Motif[];
  } | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [inputStructure, setInputStructure] = useState('');

  // Separate loading states
  const [loadingMotifs, setLoadingMotifs] = useState(false);
  const [loadingNewMotifs, setLoadingNewMotifs] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState<string[]>([]); // Store all progress updates
  const abortControllerRef = useRef<AbortController | null>(null); // Ref to store AbortController
  const [error, setError] = useState<string | null>(null);

  // Fetch paginated motifs when component mounts or page/itemsPerPage changes
  useEffect(() => {
    const fetchMotifs = async () => {
      console.log('Fetching motifs...');
      setLoadingMotifs(true);
      setError(null); // Clear previous errors
      try {
        const data = await motifService.getFilteredPaginatedMotifs(
          currentPage,
          itemsPerPage,
          selectedFilters,
          searchQuery,
          selectedSort,
          sortOrder
        );
        setItems(data.motifs); // Set the fetched motifs
        const totalPages = Math.ceil(data.totalItems / itemsPerPage);
        setCurrentPage(Math.max(Math.min(currentPage, totalPages), 1)); // Reset current page if it exceeds total pages
        setTotalPages(totalPages); // Calculate total pages
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoadingMotifs(false); // Stop loading after the request completes
      }
    };

    const fetchStructures = async () => {
      console.log('Fetching structures...');
      setLoadingMotifs(true);
      setError(null); // Clear previous errors
      try {
        const data = await structureService.getFilteredPaginatedStructures(
          currentPage,
          itemsPerPage,
          selectedFilters,
          searchQuery,
          selectedSort,
          sortOrder
        );

        setItems(data.strucs); // Set the fetched structures
        const totalPages = Math.ceil(data.totalItems / itemsPerPage);
        setCurrentPage(Math.max(Math.min(currentPage, totalPages), 1)); // Reset current page if it exceeds total pages
        setTotalPages(totalPages); // Calculate total pages
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoadingMotifs(false); // Stop loading after the request completes
      }
    };

    itemType === 'motifs' ? fetchMotifs() : fetchStructures();
  }, [itemType, currentPage, itemsPerPage, searchQuery, selectedFilters, selectedSort, sortOrder]);

  const handleViewClick = (item: Motif | Structure) => {
    const itemsPageState: ItemsPageState = {
      viewMode,
      currentPage,
      itemsPerPage,
      searchQuery,
      selectedFilters,
      selectedSort,
      sortOrder,
    };
    navigate(`/item/${item.id}`, {
      state: {
        item,
        itemsPageState,
      },
    });
  };

  const handleNewButtonClick = () => {
    setIsDialogVisible(true);
  };

  const handleNewMotifsRedirection = () => {
    if (response && response.motifs && response.motifs.length > 0) {
      navigate('/new', {
        state: {
          motifs: response?.motifs,
        },
      });
    } else {
      handleCancelNewMotifs();
    }
  };

  const handleDialogSubmit = async (newStructure: string) => {
    setError(null);
    setProgressUpdates([]);
    setIsDialogVisible(false); // Close the dialog
    setLoadingNewMotifs(true);

    // Initialize AbortController
    abortControllerRef.current = new AbortController();

    try {
      setInputStructure(newStructure);
      const motifs: Motif[] = await motifService.newStructure(
        newStructure,
        (progressUpdate: string) => {
          setProgressUpdates(prevUpdates => [...prevUpdates, progressUpdate]);
        },
        abortControllerRef.current.signal // Pass the signal to the service
      );
      setResponse({
        motifs,
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Request was canceled');
      } else {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const handleCancelNewMotifs = () => {
    // Abort the ongoing request
    setLoadingNewMotifs(false);
    setProgressUpdates([]);
    setResponse(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleServerToggle = () => {
    const newType = itemType === 'motifs' ? 'structs' : 'motifs';
    setLoadingMotifs(true);
    setItemType(newType);
    setSelectedFilters(
      itemType === 'motifs' ? ['eterna', '5s'] : familyMapping.map(item => item.value)
    );
    setSelectedSort(newType === 'motifs' ? 'Number of Families' : 'Number of Motifs');
    setItemsPerPage(newType === 'motifs' ? 30 : 20);
  };

  // Render loading, error, or the grid of motifs
  if (loadingMotifs) {
    return (
      <LoadingSpinner
        message={`Loading ${
          itemType === 'motifs' ? 'Motifs' : 'Structures (might take about 30 seconds)'
        }...`}
      />
    );
  }

  if (loadingNewMotifs) {
    return (
      <FindNewMotifsProgress
        inputStructure={inputStructure}
        progressUpdates={progressUpdates}
        response={response}
        onRedirectNowClick={handleNewMotifsRedirection}
        onCancel={handleCancelNewMotifs}
      />
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderItems = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid-container">
          {items.map((item, index) => (
            <MotifItem
              key={index}
              item={item as Motif}
              onViewClick={() => handleViewClick(item as Motif)}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div>
          {itemType === 'motifs' ? (
            <div className="list-header list-header-motif">
              <span>Motif ID</span>
              <span>#Families</span>
              <span>#Occurrences</span>
              <span>Length</span>
              <span>#Boundary Pairs</span>
              <span>#Internal Pairs</span>
              <span>#Loops</span>
            </div>
          ) : (
            <div className="list-header list-header-structure">
              <span>Structure ID</span>
              <span>Family</span>
              <span>Length</span>
              <span>#Pairs</span>
              <span>#Loops</span>
              <span>#Motifs</span>
            </div>
          )}
          <div className="list-container">
            {items.map((item, index) => {
              const isMotif = itemType === 'motifs';

              if (isMotif) {
                return (
                  <MotifListItem
                    key={index}
                    item={item as Motif}
                    onViewClick={() => handleViewClick(item as Motif)}
                  />
                );
              } else {
                return (
                  <StructureListItem
                    key={index}
                    item={item as Structure}
                    onViewClick={() => handleViewClick(item as Structure)}
                  />
                );
              }
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.title}>Motif Server</div>
        <div className={styles.subtitle}>Web Server for Undesignable RNA Motifs and Structures</div>
        <div className={styles.papers} style={{ marginTop: '6px' }}>
          Papers:
          <a
            href="https://link.springer.com/chapter/10.1007/978-1-0716-3989-4_17"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.paperLink}
          >
            RECOMB 2024
          </a>
          &
          <a
            href="https://link.springer.com/chapter/10.1007/978-3-031-90252-9_10"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.paperLink}
          >
            RECOMB 2025
          </a>
        </div>
      </div>

      <div className={styles.postHeaderRow}>
        <div>
          See{' '}
          <a
            href={`${process.env.REACT_APP_BASENAME}/help`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.helpLink}
          >
            Help & Documentation
          </a>{' '}
          to learn how to use the server and interpret results.
        </div>

        <div className={styles.credit}>
          Web Server Created by{' '}
          <a
            href="https://apoorvmalik.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creditLink}
          >
            Apoorv Malik
          </a>
        </div>
      </div>

      <div className="border">
        <div
          className="inline-container border"
          style={{
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '0px',
            borderWidth: '0px 0px 1px 0px',
            height: '82px',
          }}
        >
          <button className="new-structure-button" onClick={handleNewButtonClick}>
            Input New Structure <br /> (Find Undesignable Motifs)
          </button>

          <div
            className="border"
            style={{
              display: 'flex',
              minWidth: '300px',
              width: '30%',
              backgroundColor: '#ccc',
              borderWidth: '0px 1px 0px 0px',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <ToggleSwitch
              leftLabel="Motifs View"
              rightLabel="Structures View"
              isLeft={itemType === 'motifs'}
              onToggle={handleServerToggle}
            />
          </div>

          <FamilyFilterDropdown
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>

        <div className="container">
          <div className="header-bar">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

            <div className="header-section">
              <div>
                <NewStructureInput
                  placeholder="Enter dot-bracket structure"
                  onInputSubmit={handleDialogSubmit}
                  isVisible={isDialogVisible}
                  onClose={handleCloseDialog}
                />
              </div>
              <div className="view-toggle">
                <button
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th-large"></i> Icon View
                </button>
                <button
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i> List View
                </button>
              </div>
              <SearchBar
                searchQuery={searchQuery}
                onSearchQueryChange={e => {
                  console.log('Search query changed:', e);
                  return setSearchQuery(e);
                }}
              />
              <SortDropdown
                itemType={itemType}
                isOpen={isSortOpen}
                toggleDropdown={toggleSortDropdown}
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
            </div>

            <div className="centered-container">
              {/* <div
                                className="centered-container"
                                style={{ gap: "0px" }}
                            ></div> */}
              <div
                className="center"
                style={{
                  marginLeft: '8px',
                  marginRight: '16px',
                }}
              >
                <ItemsPerPage itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} />
              </div>
            </div>
          </div>
          {renderItems()}
        </div>
      </div>
    </div>
  );
};

export default AllMotifsPage;
