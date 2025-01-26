$(document).ready(function () {
  $(".modal").hide();

  var table = $("#example").DataTable({
    columnDefs: [
      { targets: 1, searchable: false, sortable: false },
      { targets: 3, searchable: false },
      { targets: 8, searchable: false, sortable: false },
    ],
    scrollY: 500,
    serverSide: true,
    processing: true,
    ajax: function (data, callback, settings) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "No Internet Connection",
          text: "Please turn on your internet and try again.",
        });
        callback({
          draw: data.draw,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: [],
        });
        return;
      }

      const searchValue = data.search.value;
      const sortColumnIndex = data.order[0].column;
      const sortDirection = data.order[0].dir;
      const sortColumnName = data.columns[sortColumnIndex].data;
      const sortOrder = sortDirection === "asc" ? 1 : -1;

      const compare = (a, b) => {
        if (a[sortColumnName] < b[sortColumnName]) return -sortOrder;
        if (a[sortColumnName] > b[sortColumnName]) return sortOrder;
        return 0;
      };

      const ajaxOptions = searchValue === ""
        ? {
            url:
              "http://dummyjson.com/users?limit=" +
              data.length +
              "&skip=" +
              data.start +
              "&sortBy=" +
              sortColumnName +
              "&order=" +
              sortDirection,
            method: "GET",
          }
        : {
            url: "http://dummyjson.com/users/search?q=" + searchValue,
            method: "GET",
          };

      $.ajax({
        ...ajaxOptions,
        success: function (response) {
          if (searchValue === "") {
            callback({
              draw: data.draw,
              recordsTotal: response.total,
              recordsFiltered: response.total,
              data: response.users,
            });
          } else {
            const filteredData = response.users
              .sort(compare)
              .slice(data.start, data.start + data.length);
            callback({
              draw: data.draw,
              recordsTotal: response.total,
              recordsFiltered: response.total,
              data: filteredData,
            });
          }
        },
        error: function () {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Please try again later.",
          });
          callback({
            draw: data.draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
        },
      });
    },
    columns: [
      { data: "id" },
      {
        data: "image",
        render: function (data) {
          return (
            '<img src="' +
            data +
            '" alt="User Image" style="width:50px;height:50px;"/>'
          );
        },
      },
      { data: "firstName" },
      { data: "lastName" },
      { data: "age" },
      {
        data: "email",
        render: function (data) {
          return '<a href="mailto:' + data + '">' + data + "</a>";
        },
      },
      {
        data: "phone",
        render: function (data) {
          return '<a href="tel:' + data + '">' + data + "</a>";
        },
      },
      {
        data: "address",
        render: function (data) {
          const lat = data.coordinates.lat;
          const lng = data.coordinates.lng;
          const address =
            data.address +
            "," +
            data.city +
            "," +
            data.state +
            "," +
            data.country;
          return (
            '<a href="https://www.google.com/maps/search/?api=1&query=' +
            lat +
            "," +
            lng +
            '" target="_blank">' +
            address +
            "</a>"
          );
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          return (
            '<button class="viewBankBtn" data-id="' +
            row.id +
            '">View Bank Details</button>'
          );
        },
      },
    ],
  });

  $("#example tbody").on("click", ".viewBankBtn", function () {
    var userId = $(this).data("id");

    var userData = table.row($(this).closest("tr")).data();

    var bankData = userData.bank;
    $(".bank-details").html(
      "<div><span>Card Number:</span> " +
        bankData.cardNumber +
        "</div>" +
        "<div><span>Card Type:</span> " +
        bankData.cardType +
        "</div>" +
        "<div><span>Card Expire:</span> " +
        bankData.cardExpire +
        "</div>" +
        "<div><span>Currency:</span> " +
        bankData.currency +
        "</div>" +
        "<div><span>IBAN:</span> " +
        bankData.iban +
        "</div>"
    );

    $("#bankModal").fadeIn();
  });

  $(".close").click(function () {
    $("#bankModal").fadeOut();
  });

  $(window).click(function (event) {
    if ($(event.target).is("#bankModal")) {
      $("#bankModal").fadeOut();
    }
  });

  $(document).on("click", ".bank-details div", function () {
    var copyTxt = $(this).text();
    navigator.clipboard.writeText(copyTxt);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Copied To Clipboard",
      showConfirmButton: false,
      timer: 1000,
    });
  });
  
  window.addEventListener("online", function () {
    table.ajax.reload(null, false);
  });
});
