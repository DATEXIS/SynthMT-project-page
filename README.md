# SynthMT: Synthetic Data Enables Human-Grade Microtubule Analysis by Tuning Segmentation Foundation Models

[Code](https://github.com/ml-lab-htw/SynthMT) - [Dataset](https://huggingface.co/datasets/HTW-KI-Werkstatt/SynthMT) - [Preprint (TBA)](https://www.biorxiv.org/)

> Studying microtubules (MTs) and their mechanical properties is central to understanding intracellular transport, cell division, and drug action, yet experts still spend many hours manually segmenting these filamentous structures.
> The suitability of state-of-the-art models for this task cannot be orderly assessed, as large-scale labeled datasets are missing.
> We address this gap by presenting the synthetic dataset SynthMT, which is the product of tuning a novel image generation pipeline on unlabeled, real-world interference reflection microscopy (IRM) frames of <i>in vitro</i> reconstituted microtubules.
> In our benchmark, we systematically test nine models in both zero- and Hyperparameter Optimization (HPO)-bbased few-shot settings.
> Across both, classical and current foundation models still struggle to achieve the accuracy required for biological downstream analysis on, to humans, visually simple <i>in vitro</i> MT IRM images.
> However, a notable exception is the recently introduced SAM3 model.
> After HPO on only ten random SynthMT images, its text-prompt version SAM3Text achieves near-perfect and in some cases super-human performance on unseen real data.
> This result indicates that fully automated MT segmentation has become feasible when model configuration is effectively guided through synthetic data.

---

This is a static website to showcase the SynthMT dataset and the results of the model evaluation.

As it is static, a simple local server is sufficient to run it:

```bash
python -m http.server
```


## Structure

* `index.html`: Main page
* `styles.css`: Styles
* `script.js`: JS
* `media/`: Media for the main page
* `data_images/`: Dataset images folder (raw and segmented)
