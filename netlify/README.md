# YVIX Assignment Portal - Netlify Frontend

This is the static frontend for the YVIX Assignment Portal, designed to be deployed on Netlify.

## Deployment Instructions

### Step 1: Deploy the Flask Backend

First, you need to deploy your Flask backend to a hosting service that supports Python applications, such as:

- [Heroku](https://www.heroku.com/)
- [PythonAnywhere](https://www.pythonanywhere.com/)
- [Google Cloud Run](https://cloud.google.com/run)
- [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/)

Follow these steps:

1. Create an account on your chosen hosting platform
2. Follow their instructions to deploy your Flask application
3. Make note of the URL where your API is hosted

### Step 2: Update the API URL

Once your Flask backend is deployed, update the API URL in the `app.js` file:

```javascript
// Configuration
const API_URL = 'https://your-flask-app-url.com'; // Replace with your deployed Flask API URL
```

Also update the redirect URL in `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-flask-app-url.com/api/:splat"
  status = 200
  force = true
  headers = {Access-Control-Allow-Origin = "*"}
```

### Step 3: Deploy to Netlify

1. Sign up for a [Netlify](https://www.netlify.com/) account if you don't have one
2. Deploy using one of these methods:

#### Option A: Deploy via Netlify UI

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Deploy manually"
3. Drag and drop this folder to the designated area
4. Wait for deployment to complete

#### Option B: Deploy via Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Deploy the site: `netlify deploy --prod`

### Step 4: Configure Environment Variables

If your application requires environment variables, set them in the Netlify UI:

1. Go to your site's dashboard on Netlify
2. Navigate to "Site settings" > "Build & deploy" > "Environment"
3. Add your environment variables

## Files

- `index.html`: Main HTML file
- `styles.css`: CSS styles
- `app.js`: JavaScript for frontend functionality
- `netlify.toml`: Netlify configuration file

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Supabase Documentation](https://supabase.io/docs)

## Notes

- This is a static frontend that communicates with your Flask API
- Make sure CORS is properly configured on your Flask backend
- Update the API_URL in app.js to point to your deployed Flask application 