var data = new Vue({
  el: '#list-complete-demo',
  delimiters: ['${', '}'],
  data: {
    // items: [{identity_id:'951959df10ee3c6e4c90e8d22063cc4ea05b4fdd.jpg' , name: '1', match_score: 0},{identity_id:'0116000d4151abe2af7af4fb01b56e663fc4469a.jpg', name: '2', match_score: 0}],
    items: [],
    nextNum: 10
  },
  methods: {
  }
})

Dropzone.options.myDropzone = {
    paramName: "file", // The name that will be used to transfer the file
    acceptedFiles: ".jpg,.png,.jpeg", //上传的类型
    headers: { "cid": "all" },
    // maxFiles: 1,
    maxFilesize: 20, //文件大小，单位：MB
    addRemoveLinks:true,
    init: function () {
        thisDropzone = this;
        this.on("success", function(file, body) {
            data.items = JSON.parse(body);
            console.log("File " + file.name + " uploaded " + body);
        });
        this.on("removedfile", function(file) {
            console.log("File " + file.name + " removed");
        });
    }
};
