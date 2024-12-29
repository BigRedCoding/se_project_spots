import {
  settings,
  enableValidation,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";

import "../pages/index.css";

import Api from "../utils/api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "43fa4645-4639-4fec-992c-ea3c61acb906",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.append(cardElement);
    });
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
    profileAvatar.src = user.avatar;
    profileAvatar.alt = user.name;
  })
  .catch(console.error);

const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

const profileEditButton = document.querySelector(".profile__edit-button");

const editProfileModal = document.querySelector("#edit-profile-modal");
const editFormElement = editProfileModal.querySelector(".modal__form");

const profileAddButton = document.querySelector(".profile__add-button");
const addCardModal = document.querySelector("#add-card-modal");
const cardModalCloseButton = addCardModal.querySelector(".modal__close-button");
const cardForm = addCardModal.querySelector(".modal__form");
const cardSubmitButton = addCardModal.querySelector(".modal__submit-button");
const profileSubmitButton = editProfileModal.querySelector(
  ".modal__submit-button"
);

const cardNameInput = addCardModal.querySelector("#add-card-name-input");
const cardLinkInput = addCardModal.querySelector("#add-card-link-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseButton = previewModal.querySelector(
  ".modal__close-button"
);

const editModalCloseButton = editProfileModal.querySelector(
  ".modal__close-button"
);

const editModalNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editModalDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const cardTemplate = document.querySelector("#card-template");

const cardsList = document.querySelector(".cards__list");

const avatarButton = document.querySelector(".profile__avatar-button");
const addAvatarModal = document.querySelector("#avatar-modal");
const avatarForm = document.querySelector("#edit-avatar-form");
const avatarInput = document.querySelector("#avatar-input");
const avatarModalCloseButton = addAvatarModal.querySelector(
  ".modal__close-button"
);
const avatarSubmitButton = addAvatarModal.querySelector(
  ".modal__submit-button"
);

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteCancelButton = deleteModal.querySelector("#cancel-delete-button");
const deleteCloseButton = deleteModal.querySelector(".modal__close-button");

let selectedCard;
let selectedCardId;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }

  cardLikeButton.addEventListener("click", (evt) => {
    handleCardLike(evt, data._id);
  });

  cardDeleteButton.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    handleImageClick(data);
  });

  return cardElement;
}

function toggleLikeClass(evt) {
  evt.target.classList.toggle("card__like-button_liked");
}

function handleCardLike(evt, dataId) {
  let isLiked = evt.target.classList.contains("card__like-button_liked")
    ? true
    : false;
  api
    .toggleLike(dataId, isLiked)
    .then(toggleLikeClass(evt))
    .catch(console.error);
}

function handleImageClick(data) {
  openModal(previewModal);
  previewModalImageEl.src = data.link;
  previewModalCaptionEl.textContent = data.name;
  previewModalImageEl.alt = data.name;
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  submitButton.textContent = "Deleting...";

  api
    .deleteCard(selectedCardId)
    .then(selectedCard.remove(), closeModal(deleteModal))
    .catch(console.error)
    .finally((submitButton.textContent = "Delete"));
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

function handleOutsideClick(modal) {
  return function (event) {
    if (!event.target.closest(".modal__content")) {
      closeModal(modal);
    }
  };
}

function handleEscapePress(modal) {
  return function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
      closeModal(modal);
    }
  };
}

let outsideClickHandler, escapePressHandler;

function openModal(modal) {
  modal.classList.add("modal_opened");

  outsideClickHandler = handleOutsideClick(modal);
  escapePressHandler = handleEscapePress(modal);

  setTimeout(() => {
    addListeners(outsideClickHandler, escapePressHandler);
  }, 1);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");

  if (outsideClickHandler && escapePressHandler) {
    removeListeners(outsideClickHandler, escapePressHandler);
  }

  outsideClickHandler = null;
  escapePressHandler = null;
}

function addListeners(outsideClickHandler, escapePressHandler) {
  document.addEventListener("click", outsideClickHandler);
  document.addEventListener("keydown", escapePressHandler);
}

function removeListeners(outsideClickHandler, escapePressHandler) {
  document.removeEventListener("click", outsideClickHandler);
  document.removeEventListener("keydown", escapePressHandler);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  submitButton.textContent = "Saving...";
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      disableButton(profileSubmitButton, settings);
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally((submitButton.textContent = "Save"));
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };

  const submitButton = evt.submitter;
  submitButton.textContent = "Saving...";

  api
    .addCard(inputValues)
    .then((card) => {
      const cardElement = getCardElement(card);
      cardsList.prepend(cardElement);
      evt.target.reset();
      disableButton(cardSubmitButton, settings);
      closeModal(addCardModal);
    })
    .catch(console.error)
    .finally((submitButton.textContent = "Save"));
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  submitButton.textContent = "Saving...";
  api
    .editAvatarInfo(avatarInput.value)
    .then(
      (profileAvatar.src = avatarInput.value),
      disableButton(avatarSubmitButton, settings),
      closeModal(addAvatarModal)
    )
    .catch(console.error)
    .finally((submitButton.textContent = "Save"));
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    profileEditButton,
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});
editModalCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
});
editFormElement.addEventListener("submit", handleEditFormSubmit);

profileAddButton.addEventListener("click", () => {
  openModal(addCardModal);
});

cardModalCloseButton.addEventListener("click", () => {
  closeModal(addCardModal);
});

cardForm.addEventListener("submit", handleCardFormSubmit);

previewModalCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

avatarButton.addEventListener("click", () => {
  openModal(addAvatarModal);
});
avatarModalCloseButton.addEventListener("click", () => {
  closeModal(addAvatarModal);
});

deleteCloseButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteCancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

enableValidation(settings);
