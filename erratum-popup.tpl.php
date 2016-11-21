<div id="erratum-overlay">
    <div id="erratum-overlay-content">
        <a id="erratum-overlay-close" href="#" class="erratum-overlay-close"></a>
        <div id="erratum-overlay-header">
            <span><?php print t('Erratum popup'); ?></span>
        </div>
        <div id="erratum-overlay-body">
            <p id="erratum-popup-text"></p>
            <div id="erratum-selected-fragment"></div>
            <?php print drupal_render($form); ?>
        </div>
    </div>
</div>