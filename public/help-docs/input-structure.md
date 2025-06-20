## Input New Structure

This tool allows users to input an **RNA secondary structure** (in dot-bracket notation) to determine whether it contains any **undesignable motifs**.

### What It Does

- Accepts an **RNA secondary structure** in **dot-bracket** notation.
- Identifies **undesignable motifs** within the structure.
- Classifies the structure as **undesignable** if there are presence of undesignable motifs.

### How to Use

1. Click the **Input New Structure** button:  
   ![Input Button](/motifserver/help-docs/figs/input_button.png)

2. Paste your RNA secondary structure (dot-bracket format) into the input box and click **Submit**:  
   ![Submit Button](/motifserver/help-docs/figs/submit_button.png)

3. The **FastMotif** algorithm will analyze the structure, identify any undesignable motifs, and generate motif visualizations if applicable:  
   ![Running Simple](/motifserver/help-docs/figs/running_simple.png)

   You can switch to the **Advanced** view to see detailed processing information:  
   ![Running Advanced](/motifserver/help-docs/figs/running_advanced.png)

4. If undesignable motifs are found, the page will automatically redirect to a visualization of the motifs. Alternatively, you can manually proceed by clicking **Redirect Now**:  
   ![Redirect Button](/motifserver/help-docs/figs/redirect_button.png)  
   ![Visualization Page](/motifserver/help-docs/figs/visualization_page.png)

5. Click **View Motif** to see detailed information about each motif:  
   ![Visualization Details](/motifserver/help-docs/figs/visualization_detailed.png)

### Output

- **If undesignable motifs are found:**
  - The structure is classified as **undesignable**.
  - A list of detected motifs is displayed, each linking to a detailed view.

- **If no undesignable motifs are found:**
  - The structure is not necessarily **designable** given the limitation of the algorithm.

### Notes

- Only the **dot-bracket structure** is required; the **nucleotide sequence is not needed**.
