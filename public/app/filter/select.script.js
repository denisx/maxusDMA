'use strict';

let showDropdown = (a) => {
	console.log(a);
	document.querySelector('.sBDCValueContainer').style.display = 'block';
	document.querySelector('.sBDCButtonContainer').style.display = 'block';
	closeDropdown();
}

let closeDropdown = () => {
	document.addEventListener('click', function hideDrop (e) {
		if (!e.target.closest('.selectBoxDropdownContainer'))
			{
				document.querySelector('.sBDCValueContainer').style.display = 'none';
				document.querySelector('.sBDCButtonContainer').style.display = 'none';
				document.removeEventListener('click', hideDrop);
			}
	})
}