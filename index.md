---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

{% assign mainData = site.data.main-data %}

<!-- begin resume -->
<div class="resume">
  <div class="container">
    <div class="resume__inner">
      <h1 class="resume__title title title--h1">{{ mainData.title }}</h1>

      <div class="resume__content">
        {% include top.html %}

        {% include info-blocks.html %}
      </div>      
    </div>
  </div>
</div>
<!-- end resume -->