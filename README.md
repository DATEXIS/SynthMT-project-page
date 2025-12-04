# SynthMT: Synthetic Data Enables Human-Grade Microtubule Analysis by Tuning Segmentation Foundation Models

[Code](https://github.com/ml-lab-htw/SynthMT) - [Dataset](https://huggingface.co/) - [Preprint](https://arxiv.org/)

> Microtubules (MTs) occur in large numbers, and domain experts spend many hours manually segmenting these filamentous structures. The readiness of current state-of-the-art foundation models for this task cannot be assessed systematically because large-scale labeled datasets are missing. We address this gap by presenting SynthMT, a synthetic benchmark specifically designed to evaluate whether current segmentation models are ready for automated MT analysis.

Our synthetic data generation pipeline produces structurally faithful and labeled images from unlabeled real-world data. Applied to exemplar IRM frames, this pipeline yields the SynthMT dataset. We judge its perceptual realism through expert rating across multiple quality dimensions. Using the accompanying evaluation framework, we systematically test nine classical and foundation models in both zero-shot and few-shot settings with HPO.

Across both settings, classical and current foundation models still struggle to achieve the accuracy required for downstream biological analysis on, to humans, visually simple *in vitro* MT IRM images. However, a notable exception is the recently introduced SAM3 model. After the HPO with only ten random images from SynthMT, its text-prompt version SAM3Text achieves near-perfect and in some cases super-human performance on unseen real data.

This finding shows that fully automated MT segmentation has arrived, but also that such performance critically depends on (synthetic) data to guide effective model configuration. To enable progress, we publicly release the SynthMT dataset, our data generation pipeline, and the evaluation code.

---

This is a static website to showcase the SynthMT dataset and the results of the foundation model evaluation.

As it's static, a simple local server is sufficient to run it:

```bash
python -m http.server
```


## Structure

* `index.html`: Main page
* `styles.css`: Styles
* `script.js`: JS
* `media/`: Media for the main page
* `data_images/`: Dataset images folder (raw and segmented)
