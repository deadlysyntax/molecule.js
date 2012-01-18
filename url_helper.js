function RemoveUrlParameter(a, b) 
{ 
	var c = ""; 
	var d = false; 
	var e = false; 
	
	if (a.indexOf("?") == -1) 
	{ 
		alert("No Url Parameters Found!"); 
		return a; 
	} 
	
	var f = a.split("?"); 
	
	if (f.length >= 2) 
	{ 
		c = c + f[0] + "?"; 
		var g = f[1].split(/[&;]/g); 
		
		for (var h = 0; h < g.length; h++) 
		{ 
			var i = g[h]; var j = i.split("="); 
			if (j.length >= 2) 
			{ 
				if (j[0] != b) 
				{ 
					c = c + i + "&"; d = true 
				} 
				else 
				{ 
					e = true 
				} 
			} 
		} 
		
		if (e == false) 
		{ 
			alert("Requested query string not found to remove"); 
			return a ;
		} 
		
		var k = c.split("?"); 
		
		if (k.length >= 2) 
		{ 
			if (k[1].trim() == "") 
			{ 
				return k[0] 
			} 
		} 
		
		if (d == true) 
		{ 
			c = c.slice(0, c.length - 1) 
		} 
		
		return c; 
	} 
} 

function UpdateUrlParameter(a, b, c) 
{ 
	if (b.trim() == "") 
	{ 
		alert("Parameter name should not be empty."); 
		return a ;
	} 
	
	if (c.trim() == "") 
	{ 
		alert("Parameter value should not be empty."); 
		return a; 
	} 
	
	var d = ""; 
	var e = false; 
	var f = false; 
	
	if (a.indexOf("?") == -1) 
	{ 
		alert("No Url Parameters Found!"); 
		return a; 
	} 
	
	var g = a.split("?"); 
	
	if (g.length >= 2) 
	{ 
		d = d + g[0] + "?"; 
		var h = g[1].split(/[&;]/g); 
		
		for (var i = 0; i < h.length; i++) 
		{ 
			var j = h[i]; 
			var k = j.split("="); 
			
			if (k.length >= 2) 
			{ 
				if (k[0] == b) 
				{ 
					f = true; 
					k[1] = c; 
					d = d + b + "=" + c + "&" 
				} 
				else 
				{ 
					d = d + j + "&" ;
				} 
				
				e = true 
			} 
		} 
		
		if (f == false) 
		{ 
			alert("Requested query string not found to remove"); 
			return a; 
		} 
		
		if (e == true) 
		{ 
			d = d.slice(0, d.length - 1) 
		} 
		
		return d; 
	} 
} 

function AddUrlParameter(a, b, c) 
{ 
	if (b.trim() == "") 
	{ 
		alert("Parameter name should not be empty."); 
		return a; 
	} 
	
	if (c.trim() == "") 
	{ 
		alert("Parameter value should not be empty."); 
		return a; 
	} 
	
	if (a.indexOf("?") == -1) 
	{ 
		return a + "?" + b + "=" + c; 
	} 
	
	var d = a.split("?"); 
	if (d.length >= 2) 
	{ 
		if (d[1].trim() == "") 
		{ 
			return d[0] + "?" + b + "=" + c; 
		} 
		
		var e = d[1].split(/[&;]/g); 
		
		for (var f = 0; f < e.length; f++) 
		{ 
			var g = e[f]; 
			var h = g.split("="); 
			if (h.length >= 2) 
			{ 
				if (h[0] == b) 
				{ 
					alert("Url Parameter with provided name already exists! Try Updating that Url Parameter."); 
					return a; 
				} 
			} 
		} 
		return a + "&" + b + "=" + c; 
	} 
}
		
		
		
		
		
		
		