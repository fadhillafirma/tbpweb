document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const input = form.querySelector('input[name="search"]');

  form.addEventListener('submit', e => {
  });

const deleteButtons = document.querySelectorAll('.delete-btn');
  const deleteModal = document.getElementById('deleteModal');
  const deleteForm = document.getElementById('deleteForm');
  const cancelDelete = document.getElementById('cancelDelete');

  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const userId = this.dataset.id;
      deleteForm.action = `/admin/users/delete/${userId}`;
      deleteModal.classList.remove('hidden');
    });
  });

  cancelDelete.addEventListener('click', function () {
    deleteModal.classList.add('hidden');
  });
});