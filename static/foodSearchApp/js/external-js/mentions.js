(function($) {
  var typedCurrentWord;
  typedCurrentWord = "";
  $.fn.mentions = function() {
    var actionsNormalChars, actionsOtherChars, currentWord, eraseSettings, eraseSettings2, hasAnyShow, id, isMention, mentioning_user, sanitizeAfterPaste, stopCharacters, suggest_users;
    if ($(this).length > 0) {
      id = $(this).attr("id");
      mentioning_user = '';
      CKEDITOR.instances[id].on("contentDom", function() {
        return this.document.on("keypress", function(e) {
          return actionsNormalChars(e);
        });
      });
      CKEDITOR.instances[id].on("key", function(e) {
        return actionsOtherChars(e);
      });
      CKEDITOR.instances[id].on("contentDom", function() {
        return CKEDITOR.instances[id].document.on("keydown", function(e) {
          var keyCode;
          keyCode = e.data.$.keyCode;
          if (keyCode === 38 || keyCode === 40) {
            return e.data.$.preventDefault();
          }
        });
      });
      CKEDITOR.instances[id].on("afterPaste", function() {
        return sanitizeAfterPaste();
      });
      CKEDITOR.instances[id].on("contentDom", function() {
        return CKEDITOR.instances[id].document.on("click", function() {
          return eraseSettings2();
        });
      });
      $(".users_mentions_list li").hover(function(e) {
        $(".users_mentions_list li").removeClass('suggested_mention_selected');
        $(".users_mentions_list li").removeClass('hover_disable');
        if (!$(this).hasClass('hide')) {
          return $(this).addClass('suggested_mention_selected');
        }
      });
      $('.users_mentions_list li').on('mousedown', function(e) {
        var selected;
        selected = $(".users_mentions_list li.suggested_mention_selected");
        if (selected.length !== 0) {
          return selected.moveSelectedMention();
        }
      });
      $(document).on("click", function(e) {
        return eraseSettings();
      });
      actionsNormalChars = function(e) {
        return window.setTimeout((function() {
          var key, keyCode, word;
          key = e.data.getKey();
          keyCode = e.data.$.which;
          word = currentWord().text;
          if ((isMention(word) === false || word === "@") && key === 64) {
            $(".users_mentions_list li").each(function() {
              return $(this).removeClass('hide');
            });
            return typedCurrentWord = "";
          } else if (isMention(word) === true) {
            if (key !== 32) {
              typedCurrentWord = typedCurrentWord + String.fromCharCode(key);
              mentioning_user = word.substring(1, word.length);
              return suggest_users(mentioning_user);
            } else {
              typedCurrentWord = "";
              return eraseSettings();
            }
          } else {
            return eraseSettings();
          }
        }), 0);
      };
      actionsOtherChars = function(e) {
        return window.setTimeout((function() {
          var key, new_selected, selected, word;
          key = e.data.keyCode;
          word = currentWord().text;
          selected = $(".users_mentions_list li.suggested_mention_selected");
          if (isMention(word) === true) {
            if (key === 37 || key === 39) {
              word = currentWord().text;
              if (isMention(word) === true) {
                return typedCurrentWord = word.substring(1, word.length);
              }
            } else if (key === 8) {
              typedCurrentWord = word.substring(1, word.length);
              mentioning_user = word.substring(1, word.length);
              suggest_users(mentioning_user);
              return $(".users_mentions_list li").each(function() {
                $(this).removeClass('hover_disable');
                return $(this).removeClass('suggested_mention_selected');
              });
            } else if (hasAnyShow() === 1) {
              switch (key) {
                case 38:
                  if (!!$(".users_mentions_list li").filter(function() {
                    return $(this).is(":hover");
                  }).length) {
                    $(".users_mentions_list li:hover").addClass("hover_disable");
                  }
                  if (selected.length !== 0) {
                    new_selected = selected.prev();
                    while (new_selected.hasClass('hide')) {
                      new_selected = new_selected.prev();
                    }
                    if (new_selected.is('li')) {
                      selected.removeClass('suggested_mention_selected');
                      new_selected.addClass("suggested_mention_selected");
                      new_selected.moveSelectedMention();
                      return suggest_users(typedCurrentWord);
                    }
                  } else {
                    new_selected = $(".users_mentions_list li").not(".hide").last();
                    new_selected.addClass("suggested_mention_selected");
                    new_selected.moveSelectedMention();
                    return suggest_users(typedCurrentWord);
                  }
                  break;
                case 40:
                  if (!!$(".users_mentions_list li").filter(function() {
                    return $(this).is(":hover");
                  }).length) {
                    $(".users_mentions_list li:hover").addClass("hover_disable");
                  }
                  if (selected.length !== 0) {
                    new_selected = selected.next();
                    while (new_selected.hasClass('hide')) {
                      new_selected = new_selected.next();
                    }
                    if (new_selected.is('li')) {
                      selected.removeClass('suggested_mention_selected');
                      new_selected.addClass("suggested_mention_selected");
                      new_selected.moveSelectedMention();
                      return suggest_users(typedCurrentWord);
                    }
                  } else {
                    new_selected = $(".users_mentions_list li").not(".hide").first();
                    new_selected.addClass("suggested_mention_selected");
                    new_selected.moveSelectedMention();
                    return suggest_users(typedCurrentWord);
                  }
                  break;
                case 13:
                  typedCurrentWord = "";
                  return eraseSettings();
              }
            }
          } else {
            return eraseSettings();
          }
        }), 0);
      };
      suggest_users = function(mentioning_user) {
        return $(".users_mentions_list li").each(function() {
          if (mentioning_user === '') {
            return $(this).removeClass('hide');
          } else {
            if ($(this).text().search(mentioning_user) !== 0) {
              return $(this).addClass('hide');
            } else {
              return $(this).removeClass('hide');
            }
          }
        });
      };
      stopCharacters = [" ", "\n", "\r", "\t", "\xa0", "\x0A"];
      currentWord = function() {
        var end, start, text;
        text = CKEDITOR.instances[id].getSelection().getRanges()[0].startContainer.getText();
        start = CKEDITOR.instances[id].getSelection().getRanges()[0].startOffset;
        if (!(start === 0 || stopCharacters.indexOf(text[start - 1]) === 0)) {
          --start;
        }
        end = CKEDITOR.instances[id].getSelection().getRanges()[0].endOffset;
        while (start >= 0) {
          if (stopCharacters.indexOf(text[start]) === -1) {
            --start;
          } else {
            break;
          }
        }
        ++start;
        currentWord.text = text.substr(start, end - start);
        currentWord.start = start;
        currentWord.end = end;
        return currentWord;
      };
      $.fn.moveSelectedMention = function() {
        var aux, end, new_end, new_page_text, new_start, page_text, page_text_parent, selected_ranges, selected_ranges_end, selected_ranges_start, start;
        start = currentWord().start;
        end = currentWord().end;
        selected_ranges = CKEDITOR.instances[id].getSelection().getRanges()[0];
        selected_ranges_start = selected_ranges.startOffset;
        selected_ranges_end = selected_ranges.endOffset;
        page_text = selected_ranges.startContainer.getText();
        page_text_parent = selected_ranges.startContainer.getParent();
        new_page_text = page_text.substring(0, start + 1) + $(this).html() + " " + page_text.substring(end + 1);
        page_text_parent.setHtml(page_text.replace(page_text, new_page_text));
        aux = ($(this).html().length) - (end - start - 1);
        new_start = selected_ranges_start + aux;
        new_end = selected_ranges_end + aux;
        if (!(new_start < 0)) {
          selected_ranges.startOffset = new_start;
        }
        if (!(new_end < 0)) {
          selected_ranges.endOffset = new_end;
        }
        selected_ranges.setStart(page_text_parent.getFirst(), selected_ranges.startOffset);
        selected_ranges.setEnd(page_text_parent.getFirst(), selected_ranges.endOffset);
        return CKEDITOR.instances[id].getSelection().selectRanges([selected_ranges]);
      };
      isMention = function(word) {
        if (word[0] === "@") {
          return true;
        } else {
          return false;
        }
      };
      hasAnyShow = function() {
        var j;
        j = 0;
        $(".users_mentions_list li").each(function() {
          if (!$(this).hasClass("hide")) {
            return j = 1;
          }
        });
        return j;
      };
      sanitizeAfterPaste = function() {
        var content, page, range;
        page = CKEDITOR.instances[id].getData();
        content = CKEDITOR.instances[id].document.$.getElementsByTagName("body");
        $(content).html(page.replace(" ", " "));
        range = CKEDITOR.instances[id].createRange();
        range.moveToElementEditEnd(range.root);
        return CKEDITOR.instances[id].getSelection().selectRanges([range]);
      };
      eraseSettings = function() {
        return $(".users_mentions_list li").each(function() {
          $(this).addClass('hide');
          $(this).removeClass('hover_disable');
          return $(this).removeClass('suggested_mention_selected');
        });
      };
      return eraseSettings2 = function() {
        var word;
        eraseSettings();
        word = currentWord().text;
        if (isMention(word) === true) {
          return typedCurrentWord = word.substring(1, word.length);
        }
      };
    }
  };
})(jQuery);
