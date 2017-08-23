(function () {
  document.addEventListener("DOMContentLoaded", function() {
    var erratum = {
      fields: Drupal.settings.erratum,
      popup: document.getElementById('erratum-overlay'),
      close: document.getElementById('erratum-overlay-close'),

      init: function() {
        var th = this;
        document.body.onkeypress = function(e) {
          th.onKeyPress(e);
        };
        this.close.onclick = function(e) {
          th.togglePopup(false);

          var message = document.getElementById('erratum-message');
          if (message) {
            message.parentElement.removeChild(message);
          }
          document.getElementById('erratum-json').value = '';
          document.getElementById('erratum-popup-form').style.display = 'block';
        };
      },
      togglePopup: function(show) {
        if (this.popup) {
          this.popup.style.display = show ? 'block' : 'none';
        }
      },
      updatePopup: function(data) {
        if (typeof this.fields[data.key] !== 'undefined') {
          var fieldSettings = this.fields[data.key];
          if (data.fragment && data.fragment.length < fieldSettings.max_length) {
            var json = {
              entity_type: fieldSettings.entity_type,
              entity_id: data.entity_id,
              entity_vid: data.entity_vid,
              field_name: fieldSettings.field_name,
              fragment: data.fragment,
              mail: fieldSettings.mail
            }
            document.getElementById('erratum-selected-fragment').innerHTML = data.pre + '<span>' + json.fragment + '</span>' + data.suf;
            document.getElementById('erratum-popup-text').innerHTML = fieldSettings.popup_text;
            document.getElementById('erratum-json').value = JSON.stringify(json);
            this.togglePopup(true);
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
              newRange.moveStart("character", -60);
              newRange.moveEnd("character", -textRange.length);
              pre = newRange.text;
              newRange = selectedText.createRange();
              newRange.moveEnd("character", 60);
              newRange.moveStart("character", textRange.length);
              suf = newRange.text;
            } else {
              textRange = "" + selectedText;
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

        var parent = this.getParent(selectedText.anchorNode, '.erratum-use');
        if (textRange == '' || !parent) {
          return;
        }

        return {
          pre: pre.substring(pre.length - 60, pre.length).replace(/^\S{1,10}\s+/, '').replace(/\s+/g, ' '),
          fragment: textRange.replace(/\s+/g, ' '),
          suf: suf.substring(0, 60).replace(/\s+\S{1,10}$/, '').replace(/\s+/g, ' '),
          key: parent.getAttribute('field-key'),
          entity_id: parent.getAttribute('field-entity-id'),
          entity_vid: parent.getAttribute('field-entity-vid')
        }
      },
      getParent: function(el, selector) {
        var matchesFn;

        ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
          if (typeof document.body[fn] == 'function') {
            matchesFn = fn;
            return true;
          }
          return false;
        });

        var parent;
        while (el) {
          parent = el.parentElement;
          if (parent && parent[matchesFn](selector)) {
            return parent;
          }
          el = parent;
        }

        return null;
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
})();
