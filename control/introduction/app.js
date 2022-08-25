let editor = new buildfire.components.carousel.editor(".carousel", []);
let introduction;
function init() {
  Introduction.get()
    .then((result) => {
      if (result) {
        introduction = new IntroductionItem(result.data);
        initTinymce();
        editor.loadItems(introduction.images);
        changeDefaultDeleteIcon();
      }
    })
    .catch((err) => {
      console.error("Error in getting Introduction::: ", err);
    });
  setupCarouselHandlers();
}

function initTinymce() {
  let timer;
  tinymce.init({
    selector: "#wysiwygContent",
    setup: function (editor) {
      editor.on("init", function (e) {
        tinymce.get("wysiwygContent").setContent(introduction.description);
      });
      editor.on("keyup", function (e) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          save();
        }, 500);
      });
      editor.on("change", function (e) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          save();
        }, 500);
      });
    },
  });
}

function setupCarouselHandlers() {
  editor.onItemChange = (item, index) => {
    if (introduction.images.length > index) {
      introduction.images[index] = item;
      save();
    }
  };

  editor.onOrderChange = (item, oldIndex, newIndex) => {
    reOrderCarousel(oldIndex, newIndex);
    save();
  };

  editor.onAddItems = (items) => {
    items.forEach((itm) => {
      itm.iconUrl = buildfire.imageLib.cropImage(
        itm.iconUrl, {
          size: "full_width",
          aspect: "16:9"
        }
      );
      introduction.images.push(itm);
    });
    save();
    changeDefaultDeleteIcon();
  };

  editor.onDeleteItem = (item, index) => {
    introduction.images.splice(index, 1);
    save();
  };

  buildfire.messaging.onReceivedMessage = (message) => {
    buildfire.navigation.navigateToTab({
      tabTitle: "Content",
      deeplinkData: {item: message.itemClicked},
    },
    (err, res) => {
      if (err) return console.error(err); // `Content` tab was not found
    }
  );
  };
}



function reOrderCarousel(from, to) {
  // Delete the item from it's current position
  var item = introduction.images.splice(from, 1);
  // Make sure there's an item to move
  if (!item.length) {
    throw new Error("There is no item in the array at index " + from);
  }
  // Move the item to its new position
  introduction.images.splice(to, 0, item[0]);
}

function save() {
  introduction.description = tinymce.activeEditor.getContent();
  Introduction.save(introduction)
    .then((result) => {})
    .catch((err2) => {
      console.error("Error in saving Introduction::: ", err2);
    });
}

function changeDefaultDeleteIcon() {
  Array.from(document.querySelectorAll(".btn-icon.btn-delete-icon")).forEach(
    (el) => {
      el.classList.remove("btn-icon", "btn-delete-icon", "btn-danger");
      el.classList.add("icon", "icon-cross2");
    }
  );
}

init();