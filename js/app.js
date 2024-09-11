document.addEventListener('DOMContentLoaded', () => {
	fetch('/json/data.json')
		.then(res => res.json())
		.then(data => {
			renderItems(data);
			loadCartFromLocalStorage();
		})
		.catch(err => console.log(err));
});

let cart = {};

const saveCartToLocalStorage = () => {
	localStorage.setItem('cart', JSON.stringify(cart));
};

const addToCart = product => {
	const productId = product.name;

	if (cart[productId]) {
		cart[productId].quantity += 1;
	} else {
		cart[productId] = {
			product: product,
			quantity: 1,
		};
	}

	updateCartUI();
	saveCartToLocalStorage();
};

const updateCartUI = () => {
	const cartList = document.querySelector('.cart-list');
	const totalItems = document.querySelector('.cart-title__counter');
	const totalCartValueElem = document.querySelector('.order-total--value');
	const noItemsElem = document.querySelector('.no-items');
	const orderTotalElem = document.querySelector('.order-total');
	const carbonNeutralElem = document.querySelector('.carbon-neutral');
	const confirmOrderBtn = document.querySelector('.confirm-order');

	cartList.innerHTML = '';

	const totalCartValue = Object.values(cart).reduce(
		(total, item) => total + parseFloat(item.product.price) * item.quantity,
		0
	);

	totalCartValueElem.innerText = `$${totalCartValue.toFixed(2)}`;
	totalItems.innerText = `(${Object.values(cart).reduce((total, item) => total + item.quantity, 0)})`;

	if (Object.keys(cart).length === 0) {
		noItemsElem.style.display = 'block';
		orderTotalElem.style.display = 'none';
		carbonNeutralElem.style.display = 'none';
		confirmOrderBtn.style.display = 'none';
	} else {
		noItemsElem.style.display = 'none';
		orderTotalElem.style.display = 'flex';
		carbonNeutralElem.style.display = 'block';
		confirmOrderBtn.style.display = 'block';

		Object.values(cart).forEach(item => {
			const cartItem = document.createElement('div');
			cartItem.classList.add('cart-item');
			cartItem.dataset.productName = item.product.name;

			const description = document.createElement('div');
			description.classList.add('cart-item__description');

			const descriptionTitle = document.createElement('div');
			descriptionTitle.classList.add('cart-item__description-title');
			descriptionTitle.innerText = item.product.name;

			const descriptionDetails = document.createElement('div');
			descriptionDetails.classList.add('cart-item__description-details');

			const descriptionCounter = document.createElement('div');
			descriptionCounter.classList.add('cart-item__description-details--counter');
			descriptionCounter.innerText = `${item.quantity}x`;

			const descriptionPrice = document.createElement('div');
			descriptionPrice.classList.add('cart-item__description-details--price');
			descriptionPrice.innerText = `$${parseFloat(item.product.price).toFixed(2)}`;

			const descriptionPriceTotal = document.createElement('div');
			descriptionPriceTotal.classList.add('cart-item__description-details--price-total');
			descriptionPriceTotal.innerText = `$${(parseFloat(item.product.price) * item.quantity).toFixed(2)}`;

			const itemRemove = document.createElement('div');
			itemRemove.classList.add('cart-item__remove');
			itemRemove.addEventListener('click', () => removeFromCart(item.product.name));

			const itemRemoveIcon = document.createElement('div');
			itemRemoveIcon.classList.add('fa-regular', 'fa-circle-xmark');

			descriptionDetails.appendChild(descriptionCounter);
			descriptionDetails.appendChild(descriptionPrice);
			descriptionDetails.appendChild(descriptionPriceTotal);
			description.appendChild(descriptionTitle);
			description.appendChild(descriptionDetails);
			cartItem.appendChild(description);
			cartItem.appendChild(itemRemove);
			itemRemove.appendChild(itemRemoveIcon);
			cartList.appendChild(cartItem);
		});
	}
};

const removeFromCart = productId => {
	if (cart[productId]) {
		delete cart[productId];
		updateCartUI();
		saveCartToLocalStorage();
	}
};

const loadCartFromLocalStorage = () => {
	const savedCart = localStorage.getItem('cart');
	if (savedCart) {
		cart = JSON.parse(savedCart);
		updateCartUI();
	}
};

const renderItems = products => {
	const productsList = document.querySelector('.products-list');
	let createdProducts = [];

	products.forEach(el => {
		const product = document.createElement('div');
		product.classList.add('product');

		const image = document.createElement('div');
		image.classList.add('image');
		image.style.backgroundImage = `url(${el.image.desktop})`;

		const addToCartBtn = document.createElement('button');
		addToCartBtn.classList.add('add-to-cart');

		const addToCartIcon = document.createElement('i');
		addToCartIcon.classList.add('fa-solid', 'fa-cart-plus');

		const productDetail = document.createElement('div');
		productDetail.classList.add('product__details');

		const category = document.createElement('p');
		category.classList.add('category');
		category.innerText = el.category;

		const name = document.createElement('p');
		name.classList.add('name');
		name.innerText = el.name;

		const price = document.createElement('p');
		price.classList.add('price');
		price.innerText = `$${parseFloat(el.price).toFixed(2)}`;

		productDetail.appendChild(category);
		productDetail.appendChild(name);
		productDetail.appendChild(price);
		product.appendChild(image);
		product.appendChild(productDetail);
		image.appendChild(addToCartBtn);
		addToCartBtn.appendChild(addToCartIcon);
		addToCartBtn.append(' Add to Cart');

		addToCartBtn.dataset.product = JSON.stringify(el);

		productsList.appendChild(product);

		createdProducts.push(product);
	});

	document.querySelectorAll('.add-to-cart').forEach(btn => {
		btn.addEventListener('click', () => {
			const productData = JSON.parse(btn.dataset.product);
			addToCart(productData);
		});
	});
};
const confirmOrderBtn = document.querySelector('.confirm-order');
const modal = document.getElementById('orderModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const startNewOrderBtn = modal.querySelector('.start-new-order');

confirmOrderBtn.addEventListener('click', () => {
	displayOrderSummary();
	document.body.classList.add('modal-open');
	modalBackdrop.classList.remove('hidden');
});

startNewOrderBtn.addEventListener('click', () => {
	startNewOrder();
	document.body.classList.remove('modal-open');
	modalBackdrop.classList.add('hidden');
});

const displayOrderSummary = () => {
	modal.classList.add('show');

	const modalCartList = modal.querySelector('.cart-list');
	modalCartList.innerHTML = ''; // Wyczyść listę przed dodaniem nowych elementów

	Object.values(cart).forEach(item => {
		const cartItem = document.createElement('div');
		cartItem.classList.add('cart-item');

		const itemDescription = document.createElement('div');
		itemDescription.classList.add('item-description');

		const itemDescriptionLeft = document.createElement('div');
		itemDescriptionLeft.classList.add('item-description__left');

		const itemDescriptionRight = document.createElement('div');
		itemDescriptionRight.classList.add('item-description__right');

		// Kontener na nazwę produktu
		const itemNameContainer = document.createElement('div');
		itemNameContainer.classList.add('item-name-container');

		// Nazwa produktu
		const itemName = document.createElement('p');
		itemName.classList.add('item-name');
		itemName.innerText = item.product.name;

		// Kontener na ilość i cenę
		const itemDetailsContainer = document.createElement('div');
		itemDetailsContainer.classList.add('item-details-container');

		// Ilość produktu z czerwoną czcionką
		const itemQuantity = document.createElement('span');
		itemQuantity.classList.add('item-quantity');
		itemQuantity.innerHTML = `${item.quantity}x`

		// Obrazek produktu
		const itemImage = document.createElement('img');
		itemImage.setAttribute('src', `${item.product.image.desktop}`);
		itemImage.setAttribute('alt', `${item.product.name}`);
		itemImage.classList.add('cart-item__image');

        const itemPrice = document.createElement('p');
        itemPrice.classList.add('item-price');
        itemPrice.innerText = `@$${item.product.price.toFixed(2)}`

        const itemPriceTotal = document.createElement('p');
		itemPriceTotal.classList.add('item-price-total');
		itemPriceTotal.innerText = `$${(parseFloat(item.product.price) * item.quantity).toFixed(2)}`;

		cartItem.appendChild(itemDescription);
		itemDescription.appendChild(itemDescriptionLeft);
		itemDescriptionLeft.appendChild(itemImage);
		itemDescription.appendChild(itemDescriptionRight);
		itemDescriptionRight.appendChild(itemDetailsContainer);
		itemDescriptionRight.appendChild(itemNameContainer);
        itemNameContainer.appendChild(itemName)
        itemDetailsContainer.appendChild(itemQuantity)
        itemDetailsContainer.appendChild(itemPrice)

		cartItem.appendChild(itemPriceTotal);

		modalCartList.appendChild(cartItem);
	});

	// Uaktualnienie całkowitej wartości koszyka
	const totalCartValueElem = modal.querySelector('.order-total--value');
	const totalCartValue = Object.values(cart).reduce(
		(total, item) => total + parseFloat(item.product.price) * item.quantity,
		0
	);
	totalCartValueElem.innerText = `$${totalCartValue.toFixed(2)}`;
};

const startNewOrder = () => {
	modal.classList.remove('show');
	cart = {};
	updateCartUI();
	saveCartToLocalStorage();
};
