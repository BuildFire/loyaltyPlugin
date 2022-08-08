
const stringsUI = {
	container: null
	,strings:null
	,stringsConfig:null
	, _debouncers: {}
	, debounce(key, fn) {
		if (this._debouncers[key]) clearTimeout(this._debouncers[key]);
		this._debouncers[key] = setTimeout(fn, 10);
	}

	, init(containerId,strings,stringsConfig) {
		this.strings=strings;
		this.stringsConfig=stringsConfig;
		this.container = document.getElementById(containerId);
		this.container.innerHTML="";
		for (let key in this.stringsConfig) {
			this.buildSection(this.container, key, this.stringsConfig[key]);
		}

		stringsUI._setupTinyMCE();


	}
	,_setupTinyMCE(){
		if(!tinymce)return;
		tinymce.remove();
		tinymce.baseURL = "../../../../scripts/tinymce";
		tinymce.init({
			selector: '.bfwysiwyg',
			min_height: 100,
			menubar: "edit | insert | format | table | tools",
			plugins: [
				'advlist autolink lists link image charmap print preview anchor textcolor',
				'searchreplace visualblocks code fullscreen',
				'insertdatetime media table paste code colorpicker'
			],
			toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image | code',
			content_css: [
				'https://fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
				'https://www.tiny.cloud/css/codepen.min.css'
			],
			setup:function(ed) {
				ed.on('change', function(e) {
					stringsUI.debounce(e.target.id, ()=>{
						if(!ed.targetElm)return;	
						stringsUI.onSave(e.target.id,ed.getContent());	
					});
				});
			}
		});
	}
	,onSave(prop,value){
		this.strings.set(prop,value);
	},

	createElement(elementType, appendTo, innerHTML, classNameArray, id) {
    let e = document.createElement(elementType);
    if (innerHTML) e.innerHTML = innerHTML;
    if (Array.isArray(classNameArray))
      classNameArray.forEach((c) => e.classList.add(c));
    if (appendTo) appendTo.appendChild(e);
    if (id) e.setAttribute('id', id);
    return e;
  	}

	, createAndAppend(elementType, innerHTML, classArray, parent) {
		let e = document.createElement(elementType);
		e.innerHTML = innerHTML;
		classArray.forEach(c => e.classList.add(c));
		parent.appendChild(e);
		return e;
	}
	, createIfNotEmpty(elementType, innerHTML, classArray, parent) {
		if (innerHTML)
			return this.createAndAppend(elementType, innerHTML, classArray, parent);
	}

	, buildSection(container, sectionProp, sectionObj) {
		let sec = this.createAndAppend("section", "", [], container);

		this.createIfNotEmpty("h1", sectionObj.title, [], sec);
		console.log(sectionObj.labels)
		if(sectionObj.labels.length && sectionObj.labels.length > 0){
			sectionObj.labels.forEach(element => {
				this.createIfNotEmpty("h5",element.title, ["sub_label_title"], sec);
				for (let key in element.subLabels) { 
					this.buildLabel(sec, sectionProp + "." + key, element.subLabels[key]);
				}
			});
			
		} else {
			for (let key in sectionObj.labels) { 
				this.buildLabel(sec, sectionProp + "." + key, sectionObj.labels[key]);

			}
		}
		container.appendChild(sec);
	}
	, buildLabel(container, prop, labelObj) {

		let div = this.createElement("div", container, "", ["form-group", "row"]);
		let divCol1 = this.createElement("div", div, "", ["col-md-4"]);
		let divCol2 = this.createElement("div", div, "", ["col-md-8"]);
		this.createElement("label", divCol1, labelObj.title, []);
		let inputElement;
		let id = prop;
		let inputType = labelObj.inputType ? labelObj.inputType.toLowerCase() : "";

		if (labelObj.inputType && ["textarea", "wysiwyg"].indexOf(inputType) >= 0)
		inputElement = this.createElement("textarea", divCol2, "", [
			"form-control",
			"bf" + inputType,
		]);
		else {
		inputElement = this.createElement("input", divCol2, "", ["form-control"]);
		inputElement.type = labelObj.inputType || "text";
		}

		inputElement.id = id;

		inputElement.autocomplete = false;
		inputElement.placeholder = labelObj.placeholder || "";

		if (labelObj.maxLength > 0) inputElement.maxLength = labelObj.maxLength;

		inputElement.required = labelObj.required;

		inputElement.setAttribute("bfString", prop);


		if(inputType=="wysiwyg"){
			//handled outside by tinyMCE
		}
		else {

			inputElement.onkeyup = (e) => {
				stringsUI.debounce(prop, ()=>{
					if (inputElement.checkValidity()) {
						inputElement.classList.remove("bg-danger");
						stringsUI.onSave(prop, inputElement.value || inputElement.innerHTML);
					}
					else
						inputElement.classList.add("bg-danger");
				});
				e.stopPropagation();
			};
		}

		return inputElement;
	}

	, scrape() {
		let obj = {};

		this.container.querySelectorAll("*[bfString]").forEach(e => {
			let s = e.getAttribute("bfString").split(".");

			if (!obj[s[0]]) obj[s[0]] = {};

			if (e.type == "TEXTAREA")
				obj[s[0]][s[1]] = e.innerHTML;
			else
				obj[s[0]][s[1]] = e.value;
		});
		return obj;
	}
};


