## Motif View Page

The **Motif View Page** allows you to browse and explore all undesignable RNA motifs identified by the system. It provides two viewing modes and tools to help you quickly find and inspect motifs of interest.

![All Motifs Page](/motifserver/help-docs/figs/all-motifs-page.png)

### Viewing Modes

- **Grid View**: Motifs are displayed as compact visual cards showing a quick snapshot of each motif’s structure and statistics.
- **List View**: A tabular format for easier comparison across motifs. Columns are sortable by properties like occurrence count or length.


### Each Motif Includes:

- **Motif ID** – Unique identifier  
- **Occurrences** – Number of times the motif appears across all RNA families  
- **Length** – Number of nucleotides in the motif  
- **Boundary Pairs** – Number of base pairs at the motif's ends  
- **Internal Pairs** – Number of base pairs entirely within the motif  
- **Loops** – Number of loops in the motif 
- **RNA Families** – Family count and their distribution  
- **SVG Preview** – Visual structure representation of the motif
- **Dot-Bracket Structure** – Textual representation of the motif's secondary structure in dot-bracket notation, the '*' character represents rest of the structure that is not part of the motif.


### Search, Filter and Sort Options

At the top of the page, you’ll find a **search bar**, **family filter options**, and **sorting options**:

- Search by **motif ID**
- Filter by RNA families (e.g., 16S, tmRNA, eterna, etc.)
- Sort by:
  - Motif length
  - Number of base pairs
  - Family count
  - Number of loops

These tools make it easy to narrow down the list and focus on motifs that meet your criteria.


### Viewing Motif Details

Clicking on **View Motif** button in any **motif entry** opens a **Motif Detail Page**, which includes:

- A larger SVG rendering of the motif structure
- Detailed statistics of the motif (as described above).
- A list of all structures where the motif appears

![Detailed Motif Page](/motifserver/help-docs/figs/detailed-motif-page.png)

Clicking on **View Structure** button from any **Structure entry** in this page opens the **Structure Detail Page**, where you can explore the full RNA secondary structure containing that motif.
