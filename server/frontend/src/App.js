import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { api } from './api';
import carsImage from './components/assets/cars.jpeg';
import './App.css';

function useResource(path, initialValue) {
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api(path).then(result => {
      if (active) {
        setData(result);
        setError('');
      }
    }).catch(error => {
      if (active) setError(error.message);
    });
    return () => { active = false; };
  }, [path]);
  return [data, error];
}

function Header({ user, setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  async function signOut() {
    try {
      await api('logout', {});
      alert('Logging out ' + user + '…');
      setUser(null);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  }
  return <header>
    <nav aria-label="Main navigation">
      <Link to="/" className="brand">Best Cars</Link>
      <Link to="/dealers">Dealerships</Link>
      <Link to="/about">About Us</Link>
      <Link to="/contact">Contact Us</Link>
      <div className="account">
        {user ? <><span>{user}</span><button onClick={signOut}>Log out</button></>
          : <><Link to="/login">Log in</Link><Link to="/register">Sign up</Link></>}
      </div>
    </nav>
    {error && <p role="alert">{error}</p>}
  </header>;
}

function Home() {
  return <main className="hero">
    <div>
      <h1>Find a car dealership you can trust</h1>
      <p>Browse dealerships by state and read reviews from their customers.</p>
      <Link className="button" to="/dealers">Browse dealerships</Link>
    </div>
    <img src={carsImage} alt="Cars lined up at a dealership" />
  </main>;
}

function About() {
  return <main className="page">
    <h1>About Us</h1>
    <p>Best Cars helps shoppers compare dealerships across the United States. Our directory brings together dealer locations and first-hand customer reviews.</p>
    <h2>What you can do</h2>
    <ul><li>Find dealerships by state.</li><li>Read customer experiences before you visit.</li><li>Share your experience after a purchase.</li></ul>
  </main>;
}

function Contact() {
  return <main className="page">
    <h1>Contact Us</h1>
    <p>For questions about a dealership, open its listing to find the address.</p>
    <p>For help with your account or to report a review, contact the Best Cars support team.</p>
    <a href="mailto:support@bestcars.example">support@bestcars.example</a>
    <p className="muted">This is a course demonstration. The support address is an example.</p>
  </main>;
}

function AccountForm({ register, setUser }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const input = Object.fromEntries(new FormData(event.currentTarget));
      const result = await api(register ? 'register' : 'login', input);
      setUser(result.userName);
      navigate('/dealers');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return <main className="page form-page">
    <h1>{register ? 'Create an account' : 'Log in'}</h1>
    <form onSubmit={submit}>
      {register && <>
        <label>First name<input name="firstName" autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
        <label>Email<input type="email" name="email" autoComplete="email" required /></label>
      </>}
      <label>Username<input name="userName" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required /></label>
      {register && <label>Confirm password<input type="password" name="confirmation" autoComplete="new-password" required /></label>}
      {error && <p role="alert">{error}</p>}
      <button disabled={saving}>{register ? 'Sign up' : 'Log in'}</button>
      {!register && <Link to="/register">Create an account</Link>}
    </form>
  </main>;
}

function Dealers({ user }) {
  const [state, setState] = useState('All');
  const [catalog, catalogError] = useResource('get_dealers', {});
  const [filtered, filterError] = useResource('get_dealers/' + encodeURIComponent(state), {});
  const states = [...new Set((catalog.dealers || []).map(dealer => dealer.state))].sort();
  const dealers = state === 'All' ? catalog.dealers : filtered.dealers;
  return <main className="page">
    <h1>Dealerships</h1>
    <label className="filter">Filter by state
      <select value={state} onChange={event => setState(event.target.value)}>
        <option value="All">All states</option>
        {states.map(state => <option key={state}>{state}</option>)}
      </select>
    </label>
    {(catalogError || filterError) && <p role="alert">{catalogError || filterError}</p>}
    <div className="table-scroll"><table>
      <thead><tr><th>Dealership</th><th>City</th><th>Address</th><th>State</th><th>ZIP</th>{user && <th>Review</th>}</tr></thead>
      <tbody>{dealers?.map(dealer => <tr key={dealer.id}>
        <td><Link to={'/dealer/' + dealer.id}>{dealer.full_name}</Link></td>
        <td>{dealer.city}</td><td>{dealer.address}</td><td>{dealer.state}</td><td>{dealer.zip}</td>
        {user && <td><Link to={'/postreview/' + dealer.id}>Post Review</Link></td>}
      </tr>)}</tbody>
    </table></div>
    {dealers?.length === 0 && <p>No dealerships found for this state.</p>}
  </main>;
}

function Dealer({ user }) {
  const { id } = useParams();
  const [details, detailError] = useResource('dealer/' + id, {});
  const [results, reviewError] = useResource('reviews/dealer/' + id, {});
  const dealer = details.dealer?.[0];
  return <main className="page">
    <Link to="/dealers">All dealerships</Link>
    <h1>{dealer?.full_name || 'Dealership details'}</h1>
    {dealer && <p>{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p>}
    {user && dealer && <Link className="button" to={'/postreview/' + id}>Post Review</Link>}
    {(detailError || reviewError) && <p role="alert">{detailError || reviewError}</p>}
    <h2>Customer reviews</h2>
    {results.reviews?.length === 0 && <p>No reviews yet.</p>}
    {results.reviews?.map(review => <article key={review.id} className="review">
      <p>{review.review}</p>
      <div className="muted">{review.name} · {review.car_year} {review.car_make} {review.car_model}
        {review.sentiment && ' · ' + review.sentiment}</div>
    </article>)}
  </main>;
}

function PostReview({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, dealerError] = useResource('dealer/' + id, {});
  const [cars, carError] = useResource('get_cars', {});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const input = Object.fromEntries(new FormData(event.currentTarget));
      await api('add_review', { ...input, dealership: id });
      navigate('/dealer/' + id);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return <main className="page form-page">
    <h1>Post Review</h1>
    <p>{dealer.dealer?.[0]?.full_name}</p>
    {user ? <form onSubmit={submit}>
      <label>Review<textarea name="review" rows="6" maxLength="2000" required /></label>
      <label>Purchase date<input name="purchase_date" type="date" required /></label>
      <label>Car make, model and year<select name="carId" defaultValue="" required>
        <option value="" disabled>Choose a car</option>
        {cars.CarModels?.map(car => <option key={car.id} value={car.id}>{car.CarMake} {car.CarModel} ({car.Year})</option>)}
      </select></label>
      {(error || dealerError || carError) && <p role="alert">{error || dealerError || carError}</p>}
      <button disabled={saving || !dealer.dealer}>Post Review</button>
    </form> : <Link to="/login">Log in to post a review</Link>}
  </main>;
}

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let active = true;
    api('session').then(result => {
      if (active) setUser(result.userName);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <>
    <Header user={user} setUser={setUser} />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<AccountForm key="login" setUser={setUser} />} />
      <Route path="/register" element={<AccountForm key="register" register setUser={setUser} />} />
      <Route path="/dealers" element={<Dealers user={user} />} />
      <Route path="/dealer/:id" element={<Dealer user={user} />} />
      <Route path="/postreview/:id" element={<PostReview user={user} />} />
    </Routes>
  </>;
}
