require("babel-polyfill");

// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';
import {render} from 'react-dom';

import type {InjectedProps} from '../../src/components/inject';

import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentRequestButtonElement,
  IbanElement,
  IdealBankElement,
  StripeProvider,
  Elements,
  injectStripe,
} from '../../src/index';

const handleBlur = () => {
  console.log('[blur]');
};
const handleChange = (change) => {
  console.log('[change]', change);
};
const handleClick = () => {
  console.log('[click]');
};
const handleFocus = () => {
  console.log('[focus]');
};
const handleReady = () => {
  console.log('[ready]');
};

const createOptions = (fontSize: string, padding: ?string) => {
  return {
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
        ...(padding ? {padding} : {}),
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
};

class _CardForm extends React.Component<InjectedProps & {fontSize: string}> {
  handleSubmit = async (ev) => {

    ev.preventDefault();
    // KINTO_TEST
    const {token: {id: cardToken, card: {id: cardId}}} = await this.props.stripe
        .createToken()

    const response = await fetch('http://localhost:3031/sub/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Kinto-Session-Authblock-Account-Id': 'abc32b95-6c04-4cff-81c8-4baf092d80e6',
      },
      body: JSON.stringify({
        // FE ONLY NEEDS TO SEND THESE TWO BELLOW TO WORKSPACES
        cardToken,
        cardId,//: "card_1F2aBWAwfGMwqxjvflg45LrQ",

        // workspaceId: "ba7a9dce-7625-468a-ae68-cdcc7d75dbc3",
        // products: [{
        //   name: "PRO_TIER",
        //   qty: 1,
        //   productType: "SUBSCRIPTION"
        // }, {
        //   name: "EXTRA_SERVERLESS_BLOCK_MEMORY",
        //   qty: 2,
        //   productType: "EXTRA_SUBSCRIPTION"
        // }],

        // WORKSPACES WILL CALCULATE THE COST AND SENT THESE TO STRIPE BLOCK
        plans: ["plan_FZTrfhMW78WNgE", "plan_FZTw3QAcyBJydP", "plan_FZTw3QAcyBJydP"],
        totalCost: 25+15+15,
        user: {
          userName: "Lol1 User",
          Email: "lol1@user.com",
          stripeId: "cus_FZ92cXbOv6cF10"
        },


        // PROJ MAN WILL CALCULATE THE COST AND SENT THESE TO STRIPE BLOCK
        // products: [{
        //   stripeId: "prod_FUaPXoh7HIiu8t",
        //   description: "1 gb of AO Memory",
        //   cost: 1500,
        // }, {
        //   stripeId: "prod_FUaPXoh7HIiu8t",
        //   description: "1 gb of AO Memory",
        //   cost: 1500
        // }],
        // user: {
        //   userName: "Lol User",
        //   Email: "lol@user.com",
        //   stripeId: "cus_FW9VXTLCDXQUHS"
        // }
      })
    });

    const json = await response.json();

    console.log(json);
    // KINTO_TEST
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Card details
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const CardForm = injectStripe(_CardForm);

class _SplitForm extends React.Component<InjectedProps & {fontSize: string}> {
  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe
        .createToken()
        .then((payload) => console.log('[token]', payload));
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Card number
          <CardNumberElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          Expiration date
          <CardExpiryElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          CVC
          <CardCvcElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const SplitForm = injectStripe(_SplitForm);

class _PaymentRequestForm extends React.Component<
  InjectedProps,
  {
    canMakePayment: boolean,
    paymentRequest: Object,
  }
> {
  constructor(props) {
    super(props);

    const paymentRequest = props.stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Demo total',
        amount: 1000,
      },
    });

    paymentRequest.on('token', ({complete, token, ...data}) => {
      console.log('Received Stripe token: ', token);
      console.log('Received customer information: ', data);
      complete('success');
    });

    paymentRequest.canMakePayment().then((result) => {
      this.setState({canMakePayment: !!result});
    });

    this.state = {
      canMakePayment: false,
      paymentRequest,
    };
  }

  state: {
    canMakePayment: boolean,
    paymentRequest: Object,
  };

  render() {
    return this.state.canMakePayment ? (
      <PaymentRequestButtonElement
        className="PaymentRequestButton"
        onBlur={handleBlur}
        onClick={handleClick}
        onFocus={handleFocus}
        onReady={handleReady}
        paymentRequest={this.state.paymentRequest}
        style={{
          paymentRequestButton: {
            theme: 'dark',
            height: '64px',
            type: 'donate',
          },
        }}
      />
    ) : null;
  }
}
const PaymentRequestForm = injectStripe(_PaymentRequestForm);

class _IbanForm extends React.Component<InjectedProps & {fontSize: string}> {
  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe
        .createSource({
          type: 'sepa_debit',
          currency: 'eur',
          owner: {
            name: ev.target.name.value,
            email: ev.target.email.value,
          },
          mandate: {
            notification_method: 'email',
          },
        })
        .then((payload) => console.log('[source]', payload));
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name
          <input name="name" type="text" placeholder="Jane Doe" required />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="jane.doe@example.com"
            required
          />
        </label>
        <label>
          IBAN
          <IbanElement
            supportedCountries={['SEPA']}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const IbanForm = injectStripe(_IbanForm);

class _IdealBankForm extends React.Component<
  InjectedProps & {fontSize: string}
> {
  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe
        .createSource({
          type: 'ideal',
          amount: 1099,
          currency: 'eur',
          owner: {
            name: ev.target.name.value,
          },
          redirect: {
            return_url: 'https://example.com',
          },
        })
        .then((payload) => console.log('[source]', payload));
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name
          <input name="name" type="text" placeholder="Jane Doe" required />
        </label>
        <label>
          iDEAL Bank
          <IdealBankElement
            className="IdealBankElement"
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize, '10px 14px')}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const IdealBankForm = injectStripe(_IdealBankForm);

class Checkout extends React.Component<{}, {elementFontSize: string}> {
  constructor() {
    super();
    this.state = {
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
    };
    window.addEventListener('resize', () => {
      if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
        this.setState({elementFontSize: '14px'});
      } else if (
        window.innerWidth >= 450 &&
        this.state.elementFontSize !== '18px'
      ) {
        this.setState({elementFontSize: '18px'});
      }
    });
  }

  render() {
    const {elementFontSize} = this.state;
    return (
      <div className="Checkout">
        <h1>Available Elements</h1>
        <Elements>
          <CardForm fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <SplitForm fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <PaymentRequestForm />
        </Elements>
        <Elements>
          <IbanForm fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <IdealBankForm fontSize={elementFontSize} />
        </Elements>
      </div>
    );
  }
}
const App = () => {
  return (
    <StripeProvider apiKey="pk_test_OsISvQbBxAIq3w8vgjTJpxtj005bloHg6I">
      <Checkout />
    </StripeProvider>
  );
};

const appElement = document.querySelector('.App');
if (appElement) {
  render(<App />, appElement);
} else {
  console.error(
    'We could not find an HTML element with a class name of "App" in the DOM. Please make sure you copy index.html as well for this demo to work.'
  );
}
