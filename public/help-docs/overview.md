## Overview and Background

### Overview

Welcome to the RNA Motif Server.

This web application allows researchers to:

- Explore undesignable RNA motifs and structures containing them  
- Analyze motifs across RNA families  
- Upload new RNA structures to find new undesignable motifs  

The interface is optimized for quick visualization and interactive exploration.

### Background

RNA design aims to find RNA sequences (𝑥) that fold into a target secondary structure (𝑦) under a specific RNA folding model, as illustrated in the figure below. For the widely adopted Turner RNA folding model, RNA folding can be computed in cubic time via dynamic programming. However, the search space of sequences is exponentially large. As a result, the RNA design problem is considered NP-hard.

![Inverse Illustration](/motifserver/help-docs/figs/inverse.png)

### Designable and Undesignable Structure

A secondary structure is designable if there exists an RNA sequence 𝑥 such that the target structure 𝑦 is the unique minimum free energy (uMFE) structure of 𝑥. Visually, this corresponds to 𝑦⁎ being the global minimum in the energy landscape of 𝑥, as illustrated in the figure below.

![Designable Landscape](/motifserver/help-docs/figs/designable_landscape.png)

Not all RNA secondary structures are computationally designable under the **unique Minimum Free Energy (uMFE)** criterion—that is, for some structures 𝑦, no RNA sequence 𝑥 will fold into 𝑦 as its unique MFE structure. In other words, for every candidate sequence 𝑥, there is always an alternative structure 𝑦′ₓ with free energy equal to or lower than that of 𝑦⁎. As illustrated in the figure below, 𝑦⁎ fails to be the global minimum in the energy landscapes of all possible sequences.

![Undesignable Landscape](/motifserver/help-docs/figs/undesignable_landscape.png)

While exhaustively enumerating all possible sequences to prove 𝑦 is undesignable is infeasible, one practical approach is to identify one or more *rival structures* that are energetically favored over 𝑦 across all possible sequences (𝑥₁ and 𝑥₂).

This is feasible because when a rival structure is similar to the target structure, the energy difference is often determined by a few critical nucleotides at sparse positions. The figure below illustrates an undesignable target structure from the Eterna100 benchmark, along with its corresponding (single) rival structure identified by the RIGENDE algorithm.

![Target and Rival Structure](/motifserver/help-docs/figs/rival_structure.png)

### Undesignable Motif

While rival structures can provide evidence of undesignability at the whole-structure level, they offer limited interpretability. In practice, undesignability often originates from specific local regions or structural motifs. Identifying the smallest such regions—called *minimal undesignable motifs*—can provide insight into why a structure resists design. This interpretability enhances both understanding and potential reuse in RNA design workflows.

The figure below shows an example from Eterna100 with three highlighted minimal undesignable motifs, identified by the FastMotif algorithm.

![Minimal Undesignable Motifs](/motifserver/help-docs/figs/minimal_motifs.png)
