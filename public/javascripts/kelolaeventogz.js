document.getElementById('formEntries').addEventListener('change', function(){
  this.submit();
});

document.getElementById('dateForm').addEventListener('change', function() {
  this.submit();
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const input = form.querySelector('input[name="search"]');

  form.addEventListener('submit', e => {
    if (input.value.trim() === '') {
      form.action = '/';
      input.name = '';
    }
  });

  const modal = document.getElementById('deleteModal');
  const confirmBtn = document.getElementById('confirmDelete');
  const cancelBtn = document.getElementById('cancelDelete');

  let deleteId = null;
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteId = btn.dataset.id;
      modal.classList.remove('hidden');
    });
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    deleteId = null;
  });

  confirmBtn.addEventListener('click', () => {
    window.location.href = `/delete/${deleteId}`;
  });
});
