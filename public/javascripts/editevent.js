 function previewPoster(event) {
      const reader = new FileReader();
      reader.onload = function () {
        const preview = document.getElementById('posterPreview');
        preview.src = reader.result;
        preview.classList.remove('hidden');
      };
      reader.readAsDataURL(event.target.files[0]);
    }