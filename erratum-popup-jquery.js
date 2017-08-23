(function ($) {
  $(document).ready(function() {
    var erratum = {
      fields: Drupal.settings.erratum,
      popup: $('#erratum-popup'),

      init: function() {
        var th = this;
        $(document).bind('keypress', function(e) {
          th.onKeyPress(e);
        });
      },
      updatePopup: function(data) {
        if (typeof this.fields[data.key] !== 'undefined') {
          $.extend(data, this.fields[data.key]);
          if (data.fragment && data.fragment.length < data.max_length) {
            var json = {
              entity_type: data.entity_type,
              entity_id: data.entity_id,
              entity_vid: data.entity_vid,
              field_name: data.field_name,
              fragment: data.fragment,
              mail: data.mail
            };

            this.popup.dialog({
              resizable: false,
              width: 400,
              modal: true,
              open: function(event, ui) {
                $(this).find('#erratum-selected-fragment').html(data.pre + '<span>' + data.fragment + '</span>' + data.suf);
                $(this).find('#erratum-popup-text').html(data.popup_text);
                $(this).find('#erratum-json').val(JSON.stringify(json));
              },
              close: function(event, ui) {
                $(this).find('#erratum-json').val('');
                $(this).find('#erratum-message').remove();
                $(this).find('#erratum-popup-form').show();
              }
            });
            this.popup.dialog('open');
          }
        }
      },
      getSelectedData: function() {
        var textRange = null,
            selectedText = null;

        if (window.getSelection) {
          selectedText = window.getSelection();
        } else {
          selectedText = (window.document.getSelection) ? window.document.getSelection() : window.document.selection;
        }

        if (selectedText != null) {
          var pre = '',
              suf = '',
              range = null,
              newRange = null;
          // Get prefix and suffix.
          if (selectedText.getRangeAt) {
            range = selectedText.getRangeAt(0);
            textRange = range.toString();
            newRange = window.document.createRange();
            newRange.setStartBefore(range.startContainer.ownerDocument.body);
            newRange.setEnd(range.startContainer, range.startOffset);
            pre = newRange.toString();
            newRange = range.cloneRange();
            newRange.setStart(range.endContainer, range.endOffset);
            newRange.setEndAfter(range.endContainer.ownerDocument.body);
            suf = newRange.toString();
          } else {
            if (selectedText.createRange) {
              range = selectedText.createRange();
              textRange = range.text;
              newRange = selectedText.createRange();
              newRange.moveStart('character', -60);
              newRange.moveEnd('character', -textRange.length);
              pre = newRange.text;
              newRange = selectedText.createRange();
              newRange.moveEnd('character', 60);
              newRange.moveStart('character', textRange.length);
              suf = newRange.text;
            } else {
              textRange = '' + selectedText;
            }
          }
          // Remove whitespaces.
          var p;
          var s = (p = textRange.match(/^(\s*)/)) && p[0].length;
          var e = (p = textRange.match(/(\s*)$/)) && p[0].length;
          pre = pre + textRange.substring(0, s);
          suf = textRange.substring(textRange.length - e, textRange.length) + suf;
          textRange = textRange.substring(s, textRange.length - e);
        } else {
          return;
        }

        var parent = $(selectedText.anchorNode).closest('.erratum-use');
        if (textRange == '' || parent.length == 0) {
          return;
        }

        return {
          pre: pre.substring(pre.length - 60, pre.length).replace(/^\S{1,10}\s+/, '').replace(/\s+/g, ' '),
          fragment: textRange.replace(/\s+/g, ' '),
          suf: suf.substring(0, 60).replace(/\s+\S{1,10}$/, '').replace(/\s+/g, ' '),
          key: parent.attr('field-key'),
          entity_id: parent.attr('field-entity-id'),
          entity_vid: parent.attr('field-entity-vid')
        }
      },
      onKeyPress: function(e) {
        var ctrlEnt = 0,
            we = window.event;
        if (we) {
          ctrlEnt = we.keyCode == 10 || (we.keyCode == 13 && we.ctrlKey);
        } else if (e) {
          ctrlEnt = (e.which == 10 && e.modifiers == 2) || (e.keyCode == 0 && e.charCode == 106 && e.ctrlKey) || (e.keyCode == 13 && e.ctrlKey);
        }
        if (ctrlEnt) {
          var selectedData = this.getSelectedData();
          if (selectedData) {
            this.updatePopup(selectedData);
          }
        }
      }
    }

    erratum.init();
  });
})(jQuery);
