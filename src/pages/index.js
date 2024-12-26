import {
  settings,
  enableValidation,
  resetValidation,
} from "../scripts/validation.js";

import "../pages/index.css";

import Api from "../utils/api.js";

// const initialCards = [
//   {
//     name: "Val Thorens",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
//   {
//     name: "Restaurant terrace",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
//   },
//   {
//     name: "An outdoor cafe",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
//   },
//   {
//     name: "A very long bridge, over the forest and through the trees",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
//   },
//   {
//     name: "Tunnel with morning light",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
//   },
//   {
//     name: "Mountain house",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
// ];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "43fa4645-4639-4fec-992c-ea3c61acb906",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, users]) => {
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.append(cardElement);
    });
    console.log(users);
    users.forEach((user) => {
      const userName = user.name;
      const userAbout = user.about;
      const userAvatar = user.avatar;

      console.log(userName, userAbout, userAvatar);
    });
  })
  .catch(console.error);

// initialCards.forEach((item) => {
//   const cardElement = getCardElement(item);
//   cardsList.append(cardElement);
// });

const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

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

  cardLikeButton.addEventListener("click", () => {
    cardLikeButton.classList.toggle("card__like-button_liked");
  });

  cardDeleteButton.addEventListener("click", (evt) => {
    cardElement.remove();
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.alt = data.name;
  });

  return cardElement;
}

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
  profileName.textContent = editModalNameInput.value;
  profileDescription.textContent = editModalDescriptionInput.value;
  disableButton(profileSubmitButton, settings);
  closeModal(editProfileModal);
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };
  const cardElement = getCardElement(inputValues);
  cardsList.prepend(cardElement);
  evt.target.reset();
  disableButton(cardSubmitButton, settings);

  closeModal(addCardModal);
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

enableValidation(settings);
