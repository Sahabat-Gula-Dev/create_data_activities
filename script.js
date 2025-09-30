document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL =
    "https://backend-javascript-sahabat-gula-166777420148.asia-southeast1.run.app";
 const ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIyMDU0MmM5LTQzODYtNDYzNi1iOTA2LTg2M2YzNmNiYzdkZCIsImVtYWlsIjoiZml0cmlAc2FoYWJhdGd1bGEuY29tIiwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJmaXRyaSIsImlhdCI6MTc1OTIyNTI1MCwiZXhwIjoxNzU5ODMwMDUwfQ.BPGnhaHUpBljb2TACGJWViGZSkiu1cDn7-HfyCw_bRY";

  const activityForm = document.getElementById("activityForm");
  const categorySelect = document.getElementById("category_id");
  const photoInput = document.getElementById("photo_file");
  const imagePreviewWrapper = document.getElementById("imagePreviewWrapper");
  const imagePreview = document.getElementById("imagePreview");
  const removeImageBtn = document.getElementById("removeImageBtn");
  const fileDropArea = document.getElementById("fileDropArea");
  const fileDropText = document.getElementById("fileDropText");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = submitBtn.querySelector(".spinner");
  const btnText = submitBtn.querySelector(".btn-text");


  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity-categories`);
      if (!response.ok) throw new Error("Gagal memuat kategori");
      const result = await response.json();
      const categories = result.data || [];
      categorySelect.innerHTML = '<option value="">Pilih Kategori...</option>';
      categories.forEach((cat) =>
        categorySelect.add(new Option(cat.name, cat.id))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification(
        "warning",
        "Gagal Memuat Kategori",
        "Anda masih bisa membuat kategori baru."
      );
    }
  };

  const handleImagePreview = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreviewWrapper.style.display = "block";
        fileDropText.textContent = `File terpilih: ${file.name}`;
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImageSelection = () => {
    photoInput.value = "";
    imagePreviewWrapper.style.display = "none";
    imagePreview.src = "#";
    fileDropText.textContent = "Klik atau drag & drop foto di sini";
  };

  const setLoadingState = (isLoading) => {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);
    btnText.textContent = isLoading ? "Menyimpan..." : "Simpan Data Aktivitas";
  };

  const showNotification = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "var(--primary-color)",
    });
  };

  const resetForm = () => {
    activityForm.reset();
    resetImageSelection();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!document.getElementById("name").value.trim()) {
      showNotification("warning", "Field Wajib", "Nama Aktivitas harus diisi.");
      document.getElementById("name").focus();
      return;
    }

    if (
      !categorySelect.value &&
      !document.getElementById("category_name").value.trim()
    ) {
      showNotification(
        "warning",
        "Kategori Wajib Diisi",
        "Silakan pilih kategori yang ada atau buat kategori baru."
      );
      return;
    }

    setLoadingState(true);
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);

    const description = document.getElementById("description").value;
    if (description) formData.append("description", description);

    const categoryId = document.getElementById("category_id").value;
    const categoryName = document.getElementById("category_name").value;
    if (categoryName) {
      formData.append("category_name", categoryName);
    } else if (categoryId) {
      formData.append("category_id", categoryId);
    }

    if (photoInput.files.length > 0) {
      formData.append("photo_file", photoInput.files[0]);
    }

    const activityFields = ["calories_burned", "duration", "duration_unit"];
    activityFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      const value = field.value.trim();
      if (value !== "") {
        formData.append(fieldId, value);
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Terjadi kesalahan pada server");

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data aktivitas berhasil disimpan.",
        timer: 2000,
        showConfirmButton: false,
      });
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Submit error:", error);
      showNotification("error", "Gagal Menyimpan", error.message);
    } finally {
      setLoadingState(false);
    }
  };

  photoInput.addEventListener("change", () =>
    handleImagePreview(photoInput.files[0])
  );
  removeImageBtn.addEventListener("click", resetImageSelection);
  ["dragover", "dragleave", "drop"].forEach((eventName) =>
    fileDropArea.addEventListener(eventName, (e) => e.preventDefault())
  );
  fileDropArea.addEventListener("dragover", () =>
    fileDropArea.classList.add("dragover")
  );
  fileDropArea.addEventListener("dragleave", () =>
    fileDropArea.classList.remove("dragover")
  );
  fileDropArea.addEventListener("drop", (e) => {
    fileDropArea.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
      photoInput.files = e.dataTransfer.files;
      handleImagePreview(photoInput.files[0]);
    }
  });
  fileDropArea.addEventListener("click", () => photoInput.click());
  activityForm.addEventListener("submit", handleFormSubmit);

  fetchCategories();
});
